// app/api/fees/[fee_id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { fee_id: string } }
) {
  const { fee_id } = params;

  const id = parseInt(fee_id, 10);
  if (isNaN(id)) {
    return NextResponse.json(
      { error: "ID de cuota inválido." },
      { status: 400 }
    );
  }

  try {
    const fee = await prisma.fee.findUnique({
      where: { fee_id: id },
      include: {
        student: {
          include: {
            parent: true,
          },
        },
        payments: true,
      },
    });

    if (!fee) {
      return NextResponse.json(
        { error: "Cuota no encontrada." },
        { status: 404 }
      );
    }

    const feeWithStringDate = {
      ...fee,
      due_date: fee.due_date.toISOString(),
    };

    return NextResponse.json(feeWithStringDate, { status: 200 });
  } catch (error) {
    console.error("Error al obtener la cuota:", error);
    return NextResponse.json(
      { error: "Error al obtener la cuota." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { fee_id: string } }
) {
  const { fee_id } = params;
  const id = parseInt(fee_id, 10);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: "ID de cuota inválido." },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { description, amount, due_date, student_id } = body;

    if (!description || !amount || !due_date || !student_id) {
      return NextResponse.json(
        {
          error:
            "Descripción, monto, fecha de vencimiento y student_id son requeridos.",
        },
        { status: 400 }
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

    const updatedFee = await prisma.fee.update({
      where: { fee_id: id },
      data: {
        description,
        amount,
        due_date: new Date(due_date),
        student_id,
      },
      include: {
        student: {
          include: {
            parent: true,
          },
        },
        payments: true,
      },
    });

    return NextResponse.json(updatedFee, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar la cuota:", error);
    if (error instanceof Error && (error as any).code == "P2025") {
      return NextResponse.json(
        { error: "Cuota no encontrada." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Error al actualizar la cuota." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { fee_id: string } }
) {
  const { fee_id } = params;
  const id = parseInt(fee_id, 10);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: "ID de cuota inválido." },
      { status: 400 }
    );
  }

  try {
    await prisma.fee.delete({
      where: { fee_id: id },
    });

    return NextResponse.json(
      { message: "Cuota eliminada exitosamente." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar la cuota:", error);
    if (error instanceof Error && (error as any).code === "P2025") {
      return NextResponse.json(
        { error: "Cuota no encontrada." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Error al eliminar la cuota." },
      { status: 500 }
    );
  }
}
