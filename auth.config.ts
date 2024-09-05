import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';
import { JWT } from 'next-auth/jwt';
import { db } from '@vercel/postgres';
import { getUserByDNI } from './app/lib/userActions';
import { signOut } from './auth';

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
      const isOnTeacher = nextUrl.pathname.startsWith('/home/profesor');
      const isOnStudent = nextUrl.pathname.startsWith('/home/alumno/cursos');
      const baseUrl = process.env.NEXTAUTH_URL;
      //@ts-ignore
      const user = await getUserByDNI(auth?.user.dni);
    
      
        if (isLoggedIn && user) {
          if (!user) {
            return signOut();
          }
          console.log("hola");
          switch (auth.user?.role) {
            case 'owner':
              if (!isOnOwner) {
                return NextResponse.redirect(baseUrl + '/home/owner');
              }
              return true;
            case 'admin':
              if (!isOnAdmin) {
                return NextResponse.redirect(baseUrl + '/home/admin/cursos');
              }
              return true;
            case 'teacher':
              if ( !isOnTeacher) {
                return NextResponse.redirect(baseUrl + '/home/profesor/materias');
              }
              return true;
            case 'student':
              if (isOnOwner || isOnAdmin || isOnTeacher) {
                return NextResponse.redirect(baseUrl + '/home/alumno/cursos');
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
          name: user.name,
          dni: user.dni,
          role: user.role,
        };
      }

      if (trigger === 'update' && session?.user) {
        try {
          const client = await db.connect();
          const result = await client.query(
            `UPDATE usuarios SET name = $1, user_type = $2 WHERE dni = $3 RETURNING *`,
            [session.user.name, session.user.role, session.user.dni]
          );
          client.release();
          if (!result.rows[0]) {
            return token;
          }
          return {
            ...token,
            dni: result.rows[0].dni,
            name: result.rows[0].name,
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

      if (token) {
        session.user = {
          ...session.user,
          dni: token.dni,
          name: token.name,
          role: token.role,
        };
      }
      return session;
    },

  },
  providers: [], 
} satisfies NextAuthConfig;
