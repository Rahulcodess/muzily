import GoogleProvider from "next-auth/providers/google";
import { prismaclient } from "@/lib/db";
import { Session } from "next-auth";

export const authOptions = {  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET ?? "secret",
  callbacks: {
    async signIn({ user }: { user: { email?: string | null } }) {
      if (!user.email) return false;
      try {
        await prismaclient.user.upsert({
          where: { email: user.email },
          update: {},
          create: {
            email: user.email,
            provider: "google",
          },
        });
      } catch (error) {
        console.error("Error saving user:", error);
      }
      return true;
    },
    async session({ session }: { session: Session }) {
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