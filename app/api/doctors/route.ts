// src/app/api/doctors/route.ts

import { NextRequest, NextResponse } from "next/server";

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

// ─── PUT /api/doctors (Update Profile) ──────────
const updateProfileSchema = z.use({
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
