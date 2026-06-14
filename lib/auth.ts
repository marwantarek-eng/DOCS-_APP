// src/lib/auth.ts
// NextAuth configuration — shared between the route handler and server helpers

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  // @ts-expect-error — @auth/prisma-adapter types are slightly ahead of next-auth v4
  adapter: PrismaAdapter(prisma),

  session: { strategy: "jwt" },

  providers: [
    // ── Google OAuth ───────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ── Doctor credentials (Phone + Syndicate ID) ──
    CredentialsProvider({
      id: "doctor-credentials",
      name: "Doctor Syndicate Login",
      credentials: {
        phone: { label: "Phone", type: "text" },
        syndicateId: { label: "Syndicate ID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.syndicateId) return null;

        // Mock Egyptian Medical Syndicate verification:
        // In production, call the real EMS API or a KYC service.
        const DEMO_ID = process.env.DEMO_SYNDICATE_ID ?? "123456789";
        const isValidSyndicate =
          credentials.syndicateId === DEMO_ID ||
          /^EG-\d{5,}$/.test(credentials.syndicateId);

        if (!isValidSyndicate) return null;

        // Upsert doctor user
        const user = await prisma.user.upsert({
          where: { phone: credentials.phone },
          update: { isVerified: true },
          create: {
            name: "طبيب جديد / New Doctor",
            phone: credentials.phone,
            role: Role.DOCTOR,
            syndicateId: credentials.syndicateId,
            isVerified: true,
          },
        });

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),

    // ── Patient credentials (Phone only) ──────────
    CredentialsProvider({
      id: "patient-credentials",
      name: "Patient Phone Login",
      credentials: {
        phone: { label: "Phone", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone) return null;

        const user = await prisma.user.upsert({
          where: { phone: credentials.phone },
          update: {},
          create: {
            name: "مريض / Patient",
            phone: credentials.phone,
            role: Role.PATIENT,
            isVerified: false,
          },
        });

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: Role }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: Role }).role = token.role as Role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};