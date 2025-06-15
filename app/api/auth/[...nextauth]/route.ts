import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prismaclient } from "@/lib/db";
import { Session } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";

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

export const authOptions = {  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET ?? "secret",
  callbacks: {
    async signIn(params: any) {
      if (!params.user.email) return false;
      try {
        await prismaclient.user.upsert({
          where: { email: params.user.email },
          update: {},
          create: {
            email: params.user.email,
            provider: "google",
          },
        });
      } catch (error) {
        console.error("Error saving user:", error);
      }
      return true;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user?.email) {
        const user = await prismaclient.user.findUnique({
          where: { email: session.user.email },
        });
        if (user) {
          session.user.id = user.id;
        }
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export const GET = handler;
export const POST = handler; 
