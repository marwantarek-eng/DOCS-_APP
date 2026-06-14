// src/app/api/doctors/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Specialty } from "@prisma/client";

// ─── GET /api/doctors ──────────────────────────
// Query params: ?specialty=ORTHOPAEDICS&location=Cairo&search=marwan&page=1&limit=20
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const specialty = searchParams.get("specialty") as Specialty | null;
    const location = searchParams.get("location");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));

    const where = {
      role: "DOCTOR" as const,
      isVerified: true,
      ...(specialty && Object.values(Specialty).includes(specialty) && { specialty }),
      ...(location && { location: { contains: location, mode: "insensitive" as const } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { bio: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [doctors, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          specialty: true,
          location: true,
          trustScore: true,
          yearsExp: true,
          isVerified: true,
          image: true,
          bio: true,
          _count: {
            select: {
              cases: { where: { isPublished: true } },
              endorsementsReceived: true,
            },
          },
        },
        orderBy: [{ trustScore: "desc" }, { createdAt: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const formatted = doctors.map((d) => ({
      id: d.id,
      name: d.name,
      specialty: d.specialty,
      location: d.location,
      trustScore: d.trustScore,
      yearsExp: d.yearsExp,
      isVerified: d.isVerified,
      image: d.image,
      bio: d.bio,
      casesCount: d._count.cases,
      endorsementCount: d._count.endorsementsReceived,
    }));

    return NextResponse.json({
      doctors: formatted,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[GET /api/doctors]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── PUT /api/doctors ──────────────────────────
// Update authenticated doctor's profile

const UpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  specialty: z.nativeEnum(Specialty).optional(),
  yearsExp: z.number().int().min(0).max(60).optional(),
  whatsappUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
});

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;
    const doctor = await prisma.user.findUnique({ where: { id: userId } });
    if (!doctor || doctor.role !== "DOCTOR") {
      return NextResponse.json({ error: "Forbidden — doctors only" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: parsed.data,
      select: {
        id: true, name: true, specialty: true, location: true,
        bio: true, trustScore: true, yearsExp: true, isVerified: true,
        whatsappUrl: true, instagramUrl: true, facebookUrl: true, websiteUrl: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/doctors]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}