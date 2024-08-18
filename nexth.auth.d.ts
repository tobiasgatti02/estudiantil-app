import { DefaultSession, DefaultUser } from "next-auth";
import { User } from "@/app/lib/definitions";

declare module "next-auth" {
  interface Session {
    user: User & {
      user_id: number;
      role: string;
      dni: string;
      name: string;
    };
  }

  interface User extends DefaultUser {
    user_id: number;
    role: string;
    dni: string;
    name: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: User & {
      user_id: number;
      role: string;
      dni: string;
      name: string;
    };
  }
}


declare module "next-auth/session" {
  interface JWT {
    user: User & {
      user_id: number;
      role: string;
      dni: string;
      name: string;
    };
  }
}