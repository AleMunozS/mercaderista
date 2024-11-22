import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { payment_id: string } }
) {
  const { payment_id } = params;

  const id = parseInt(payment_id, 10);
  if (isNaN(id)) {
    return NextResponse.json(
      { error: "ID de pago inválido." },
      { status: 400 }
    );
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { payment_id: id },
      include: {
        parent: true,
        fee: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Pago no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(payment, { status: 200 });
  } catch (error) {
    console.error("Error al obtener el pago:", error);
    if (error instanceof Error && (error as any).code === "P2025") {
      return NextResponse.json(
        { error: "Pago no encontrado." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Error al obtener el pago." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { payment_id: string } }
) {
  const { payment_id } = params;
  const id = parseInt(payment_id, 10);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: "ID de pago inválido." },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { parent_id, fee_id, amount, status, payment_method } = body;

    if (!parent_id || !fee_id || !amount || !status || !payment_method) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos." },
        { status: 400 }
      );
    }

    const updatedPayment = await prisma.payment.update({
      where: { payment_id: id },
      data: {
        parent_id,
        fee_id,
        amount,
        status,
        payment_method,
      },
      include: {
        parent: true,
        fee: true,
      },
    });

    return NextResponse.json(updatedPayment, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar el pago:", error);
    if (error instanceof Error && (error as any).code === "P2025") {
      return NextResponse.json(
        { error: "Pago no encontrado." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Error al actualizar el pago." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { payment_id: string } }
) {
  const { payment_id } = params;
  const id = parseInt(payment_id, 10);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: "ID de pago inválido." },
      { status: 400 }
    );
  }

  try {
    await prisma.payment.delete({
      where: { payment_id: id },
    });

    return NextResponse.json(
      { message: "Pago eliminado exitosamente." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar el pago:", error);
    if (error instanceof Error && (error as any).code === "P2025") {
      return NextResponse.json(
        { error: "Pago no encontrado." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Error al eliminar el pago." },
      { status: 500 }
    );
  }
}
