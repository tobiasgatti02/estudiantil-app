import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByName } from "./app/lib/actions";

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
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as string;
            }
            return session;
        },
    },
    providers: [
        CredentialsProvider({
            credentials: {
                name: {},
                password: {},
            },
            async authorize(credentials: any) {
                if (credentials === null) return null;

                try {
                    const user = await getUserByName(credentials.name);
                    if (user) {
                        const isMatch = user.password === credentials.password;
                        if (isMatch) {
                            return { ...user, id: user.id.toString() };
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