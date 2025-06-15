import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

const handler = NextAuth(authOptions);
export const GET = handler;
export const POST = handler; 
