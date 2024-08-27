import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByDNI, getUserByDni } from "./app/lib/userActions";
import { User } from "./app/lib/definitions";

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {     
                 // @ts-ignore
                token.role = user.user_type;
                token.dni = user.dni;
                token.name = user.name;
                
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                                // @ts-ignore

                session.user.user_type = token.role as string;
                session.user.dni = token.dni as string; // Añade el dni a la sesión
                session.user.name = token.name as string;

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
                    console.log("credentials as string");
                    console.log(credentials.dni as string);
                    const [user]: User[] = await getUserByDNI(credentials.dni as string);
                    console.log("credentials as string");
                    if (user) {
                        console.log(user);
                        const isMatchDni = user.dni === credentials.dni;
                        const isMatchName = user.name === credentials.name;
                        const isMatch = user.password === credentials.password;
                        if (isMatch && isMatchDni && isMatchName) {
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
