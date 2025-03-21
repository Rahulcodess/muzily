import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prismaclient } from "@/lib/db";

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
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; // ✅ Keep your existing exports
