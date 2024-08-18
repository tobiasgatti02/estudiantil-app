import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByDni } from "./app/lib/userActions";
import { User } from "./app/lib/definitions";

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {     
                 // @ts-ignore
                token.role = user.user_type;
                token.dni = user.dni;
                
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                                // @ts-ignore

                session.user.user_type = token.role as string;
                session.user.dni = token.dni as string; // Añade el dni a la sesión
            }
            return session;
        },
    },
    providers: [
        CredentialsProvider({
            credentials: {
                name: {},
                password: {},
                dni: {},
            },                // @ts-ignore

            async authorize(credentials: Partial<Record<"name" | "password" | "dni", unknown>>, request: Request): Awaitable<User | null> {
                if (credentials === null) return null;

                try {
                    const [user]: User[] = await getUserByDni(credentials.dni as string);
                    if (user) {
                        const isMatch = user.password === credentials.password;
                        if (isMatch) {
                            return { ...user };
                        } else {
                            throw new Error("Name or Password is not correct");
                        }
                    } else {
                        throw new Error("User not found");
                    }
                } catch (error) {
                    throw new Error(error as string);
                }
            },
        }),
    ],
});
