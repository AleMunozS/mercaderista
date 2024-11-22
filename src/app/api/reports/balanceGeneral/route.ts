// app/api/reports/balanceGeneral/route.ts
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

    // Calcular total de ingresos (pagos completados)
    const totalIngresos = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: "COMPLETED",
      },
    });

    // Calcular total de gastos (salarios pagados)
    const totalGastos = await prisma.salary.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: "PAID",
      },
    });

    return NextResponse.json({
      academicYear: `${academicYearNum}-${academicYearNum + 1}`,
      totalIngresos: totalIngresos._sum.amount || 0,
      totalGastos: totalGastos._sum.amount || 0,
      balanceNeto:
        (totalIngresos._sum.amount || 0) - (totalGastos._sum.amount || 0),
    });
  } catch (error) {
    console.error("Error al obtener el Balance General:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
