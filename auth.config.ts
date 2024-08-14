import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';
import { JWT } from 'next-auth/jwt';
import { db } from '@vercel/postgres';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnOwner = nextUrl.pathname.startsWith('/home/owner');
      const isOnAdmin = nextUrl.pathname.startsWith('/home/admin');
      const isOnTeacher = nextUrl.pathname.startsWith('/home/teacher');
      const isOnStudent = nextUrl.pathname.startsWith('/home/student');
      const isOnLogin = nextUrl.pathname.startsWith('/auth/login');
      const baseUrl = process.env.NEXTAUTH_URL;

      if (isLoggedIn) {
        switch (auth?.user?.role) {
          case 'owner':
            if (!isOnOwner) {
              return NextResponse.redirect(baseUrl + '/home/owner');
            }
            return true;
          case 'admin':
            if (isOnOwner) {
              return NextResponse.redirect(baseUrl + '/home/admin');
            }
            return true;
          case 'teacher':
            if (isOnOwner || isOnAdmin) {
              return NextResponse.redirect(baseUrl + '/home/teacher');
            }
            return true;
          case 'student':
            if (isOnOwner || isOnAdmin || isOnTeacher) {
              return NextResponse.redirect(baseUrl + '/home/student');
            }
            return true;
          default:
            return NextResponse.redirect(baseUrl + '/auth/login');
        }
      } else {
        if (isOnOwner || isOnAdmin || isOnTeacher || isOnStudent) {
          return NextResponse.redirect(baseUrl + '/auth/login');
        }
        return true;
      }
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'signIn') {
        return {
          ...token,
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }

      if (trigger === 'update' && session?.user) {
        try {
          const client = await db.connect();
          const result = await client.query(
            `UPDATE usuarios SET name = $1, role = $2 WHERE email = $3 RETURNING *`,
            [session.user.name, session.user.role, session.user.email]
          );
          client.release();

          if (!result.rows[0]) {
            return token;
          }

          return {
            ...token,
            id: result.rows[0].id,
            email: result.rows[0].email,
            role: result.rows[0].role,
          };
        } catch (error) {
          console.error('Error updating user:', error);
          return token;
        }
      }

      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          email: token.email,
          role: token.role,
        },
      };
    },
  },
  providers: [], // Asegúrate de agregar tus proveedores aquí
} satisfies NextAuthConfig;