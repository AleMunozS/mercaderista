// app/api/reports/outstandingPayments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get("academicYear");

    if (!academicYear) {
      return NextResponse.json(
        { error: 'El parámetro "academicYear" es requerido.' },
        { status: 400 }
      );
    }

    const academicYearNum = parseInt(academicYear);
    if (
      isNaN(academicYearNum) ||
      academicYearNum < 2000 ||
      academicYearNum > 2100
    ) {
      return NextResponse.json(
        {
          error:
            'El parámetro "academicYear" debe ser un número válido entre 2000 y 2100.',
        },
        { status: 400 }
      );
    }

    const startDate = new Date(academicYearNum, 8, 1); // Septiembre 1
    const endDate = new Date(academicYearNum + 1, 7, 31, 23, 59, 59); // Agosto 31

    // Recuperar pagos pendientes dentro del rango de fechas
    const pendingPayments = await prisma.payment.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: "PENDING", // Asumiendo que 'PENDING' es el estado para pagos pendientes
      },
      include: {
        fee: {
          include: {
            student: true, // Incluir información del estudiante
          },
        },
        parent: true, // Incluir información del padre
      },
    });

    // Formatear los datos para la respuesta
    const formattedPayments = pendingPayments.map((payment) => ({
      paymentId: payment.payment_id,
      studentName: payment.fee.student.name,
      parentName: payment.parent.name,
      amount: payment.amount,
      paymentMethod: payment.payment_method,
      dueDate: payment.fee.due_date,
      date: payment.date,
    }));

    return NextResponse.json({
      academicYear: `${academicYearNum}-${academicYearNum + 1}`,
      pendingPayments: formattedPayments,
    });
  } catch (error) {
    console.error("Error al obtener los pagos pendientes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
