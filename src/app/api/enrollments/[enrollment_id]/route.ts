// app/api/enrollments/[enrollment_id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";
import type {
  EnrollmentExtended,
  EnrollmentFormValues,
} from "../../../../types/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { enrollment_id: string } }
) {
  const { enrollment_id } = params;

  const id = parseInt(enrollment_id, 10);
  if (isNaN(id)) {
    return NextResponse.json(
      { error: "ID de inscripción inválido." },
      { status: 400 }
    );
  }

  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { enrollment_id: id },
      include: {
        student: {
          include: {
            parent: true,
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Inscripción no encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json(enrollment, { status: 200 });
  } catch (error) {
    console.error("Error al obtener la inscripción:", error);
    return NextResponse.json(
      { error: "Error al obtener la inscripción." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { enrollment_id: string } }
) {
  const { enrollment_id } = params;
  const id = parseInt(enrollment_id, 10);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: "ID de inscripción inválido." },
      { status: 400 }
    );
  }

  try {
    const body: EnrollmentFormValues = await request.json();
    const { student_id, grade, academic_year } = body;

    if (!student_id || !grade || !academic_year) {
      return NextResponse.json(
        { error: "student_id, grade y academic_year son requeridos." },
        { status: 400 }
      );
    }

    const enrollmentExists = await prisma.enrollment.findUnique({
      where: { enrollment_id: id },
    });

    if (!enrollmentExists) {
      return NextResponse.json(
        { error: "Inscripción no encontrada." },
        { status: 404 }
      );
    }

    const studentExists = await prisma.student.findUnique({
      where: { student_id: student_id },
    });

    if (!studentExists) {
      return NextResponse.json(
        { error: "El estudiante asociado no existe." },
        { status: 400 }
      );
    }

    const updatedEnrollment: EnrollmentExtended =
      await prisma.enrollment.update({
        where: { enrollment_id: id },
        data: {
          student_id,
          grade,
          academic_year,
        },
        include: {
          student: {
            include: {
              parent: true,
            },
          },
        },
      });

    return NextResponse.json(updatedEnrollment, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar la inscripción:", error);
    return NextResponse.json(
      { error: "Error al actualizar la inscripción." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { enrollment_id: string } }
) {
  const { enrollment_id } = params;
  const id = parseInt(enrollment_id, 10);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: "ID de inscripción inválido." },
      { status: 400 }
    );
  }

  try {
    await prisma.enrollment.delete({
      where: { enrollment_id: id },
    });

    return NextResponse.json(
      { message: "Inscripción eliminada exitosamente." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar la inscripción:", error);
    return NextResponse.json(
      { error: "Error al eliminar la inscripción." },
      { status: 500 }
    );
  }
}
