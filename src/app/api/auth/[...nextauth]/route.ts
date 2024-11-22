import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const predefinedUser = {
  username: "superadmin",
  password: "superadmin",
  role: "admin",
};

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials?.username === predefinedUser.username &&
          credentials?.password === predefinedUser.password
        ) {
          return {
            id: "1",
            name: predefinedUser.username,
            email: "developer@example.com",
            role: predefinedUser.role,
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST };
