/* eslint-disable */

// next-auth.d.ts

import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
  }

  interface Session {
    user?: {
      id?: string;
      name?: string;
      email?: string;
      role?: string;
    };
  }

  interface JWT {
    role?: string;
  }
}
