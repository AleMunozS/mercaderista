// app/api/reports/paymentStatusSummary/route.ts
import {  NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const statusSummary = await prisma.payment.groupBy({
      by: ["status"],
      _sum: { amount: true },
      _count: { status: true },
    });

    return NextResponse.json({
      statusSummary: statusSummary.map((item) => ({
        status: item.status,
        totalAmount: item._sum.amount || 0,
        count: item._count.status || 0,
      })),
    });
  } catch (error) {
    console.error("Error al obtener el resumen de estado de pagos:", error);
    return NextResponse.json(
      { error: "Error al obtener el resumen de estado de pagos." },
      { status: 500 }
    );
  }
}
