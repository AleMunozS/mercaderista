// app/api/reports/totalPayments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Asegúrate de que la ruta sea correcta

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('academicYear');
    const paymentMethod = searchParams.get('paymentMethod');
    const paymentStatus = searchParams.get('paymentStatus');
    const grade = searchParams.get('grade');

    if (!academicYear) {
      return NextResponse.json(
        { error: 'El parámetro "academicYear" es requerido.' },
        { status: 400 }
      );
    }

    const academicYearNum = parseInt(academicYear);
    if (isNaN(academicYearNum) || academicYearNum < 2000 || academicYearNum > 2100) {
      return NextResponse.json(
        { error: 'El parámetro "academicYear" debe ser un número válido entre 2000 y 2100.' },
        { status: 400 }
      );
    }

    const startDate = new Date(academicYearNum, 8, 1); // Septiembre 1
    const endDate = new Date(academicYearNum + 1, 7, 31, 23, 59, 59); // Agosto 31

    const whereClause: any = {
      date: {
        gte: startDate,
        lte: endDate,
      },
      status: 'COMPLETED',
      fee: {
        student: {},
      },
    };

    if (paymentMethod) {
      whereClause.payment_method = paymentMethod;
    }

    if (paymentStatus) {
      whereClause.status = paymentStatus;
    }

    if (grade) {
      whereClause.fee.student.grade = grade;
    }

    const totalPayments = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: whereClause,
    });

    return NextResponse.json({
      academicYear: `${academicYearNum}-${academicYearNum + 1}`,
      totalPayments: totalPayments._sum.amount || 0,
    });
  } catch (error) {
    console.error('Error al obtener el total de pagos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
