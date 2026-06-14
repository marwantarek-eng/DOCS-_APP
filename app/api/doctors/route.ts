// src/app/api/doctors/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { z } from "zod";
import { Specialty } from "@prisma/client";

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

    return NextResponse.json({
      doctors,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET_DOCTORS_ERROR", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().optional(),
  yearsExp: z.number().min(0).max(60).optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateProfileSchema.parse(body);

    const updatedDoctor = await prisma.user.update({
      where: { id: session.user.id },
      data: validatedData,
      select: {
        id: true,
        name: true,
        bio: true,
        location: true,
        yearsExp: true,
      },
    });

    return NextResponse.json(updatedDoctor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("PUT_DOCTORS_ERROR", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
