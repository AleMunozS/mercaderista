// app/api/students/[student_id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { student_id: string } }
) {
  const { student_id } = params;

  const id = parseInt(student_id, 10);
  if (isNaN(id)) {
    return NextResponse.json(
      { error: "ID de estudiante inválido." },
      { status: 400 }
    );
  }

  try {
    const student = await prisma.student.findUnique({
      where: { student_id: id },
      include: {
        parent: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Estudiante no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(student, { status: 200 });
  } catch (error) {
    console.error("Error al obtener el estudiante:", error);
    return NextResponse.json(
      { error: "Error al obtener el estudiante." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { student_id: string } }
) {
  const { student_id } = params;
  const id = parseInt(student_id, 10);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: "ID de estudiante inválido." },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { name, grade, parent_id } = body;

    if (!name || !grade || !parent_id) {
      return NextResponse.json(
        { error: "Nombre, grado y parent_id son requeridos." },
        { status: 400 }
      );
    }

    const parentExists = await prisma.parent.findUnique({
      where: { parent_id: parent_id },
    });

    if (!parentExists) {
      return NextResponse.json(
        { error: "El padre asociado no existe." },
        { status: 400 }
      );
    }

    const updatedStudent = await prisma.student.update({
      where: { student_id: id },
      data: {
        name,
        grade,
        parent_id,
      },
      include: {
        parent: true,
      },
    });

    return NextResponse.json(updatedStudent, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar el estudiante:", error);

    if (error instanceof Error && (error as any).code === "P2025") {
      return NextResponse.json(
        { error: "Estudiante no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Error al actualizar el estudiante." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { student_id: string } }
) {
  const { student_id } = params;
  const id = parseInt(student_id, 10);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: "ID de estudiante inválido." },
      { status: 400 }
    );
  }

  try {
    await prisma.student.delete({
      where: { student_id: id },
    });

    return NextResponse.json(
      { message: "Estudiante eliminado exitosamente." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar el estudiante:", error);

    if (error instanceof Error && (error as any).code === "P2025") {
      return NextResponse.json(
        { error: "Estudiante no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Error al eliminar el estudiante." },
      { status: 500 }
    );
  }
}
