// app/api/reports/pendingFees/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parámetros de búsqueda
    const academicYear = searchParams.get("academicYear");
    const studentName = searchParams.get("studentName");
    const grade = searchParams.get("grade");
    const parentName = searchParams.get("parentName");
    const paymentMethod = searchParams.get("paymentMethod");
    const dueDateFrom = searchParams.get("dueDateFrom");
    const dueDateTo = searchParams.get("dueDateTo");
    const minPendingAmount = searchParams.get("minPendingAmount");
    const maxPendingAmount = searchParams.get("maxPendingAmount");

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

    const feeWhereClause: any = {
      due_date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (studentName) {
      feeWhereClause.student = {
        name: {
          contains: studentName,
          mode: "insensitive",
        },
      };
    }

    if (grade) {
      feeWhereClause.grade = grade;
    }

    if (parentName) {
      feeWhereClause.student = {
        ...feeWhereClause.student,
        parent: {
          name: {
            contains: parentName,
            mode: "insensitive",
          },
        },
      };
    }

    if (paymentMethod) {
      feeWhereClause.payments = {
        some: {
          payment_method: paymentMethod as any, // Casting según tu enum
        },
      };
    }

    if (dueDateFrom || dueDateTo) {
      feeWhereClause.due_date = {
        ...(dueDateFrom ? { gte: new Date(dueDateFrom) } : {}),
        ...(dueDateTo ? { lte: new Date(dueDateTo) } : {}),
      };
    }

    // Recuperar todas las cuotas dentro del rango de fechas y aplicar filtros
    const fees = await prisma.fee.findMany({
      where: feeWhereClause,
      include: {
        student: {
          include: {
            parent: true,
          },
        },
        payments: true,
      },
    });

    // Filtrar las cuotas pendientes con filtros de monto pendiente
    let pendingFees = fees
      .map((fee) => {
        const totalPagado = fee.payments.reduce(
          (sum, payment) => sum + payment.amount,
          0
        );
        const montoPendiente = fee.amount - totalPagado;
        return {
          feeId: fee.fee_id,
          description: fee.description,
          amountTotal: fee.amount,
          montoPagado: totalPagado,
          montoPendiente: montoPendiente > 0 ? montoPendiente : 0,
          dueDate: fee.due_date,
          studentName: fee.student.name,
          parentName: fee.student.parent.name,
          studentId: fee.student.student_id,
          parentId: fee.student.parent.parent_id,
        };
      })
      .filter((fee) => fee.montoPendiente > 0);

    // Aplicar filtros de monto pendiente
    if (minPendingAmount) {
      pendingFees = pendingFees.filter(
        (fee) => fee.montoPendiente >= parseFloat(minPendingAmount)
      );
    }

    if (maxPendingAmount) {
      pendingFees = pendingFees.filter(
        (fee) => fee.montoPendiente <= parseFloat(maxPendingAmount)
      );
    }

    return NextResponse.json({
      academicYear: `${academicYearNum}-${academicYearNum + 1}`,
      pendingFees: pendingFees,
    });
  } catch (error) {
    console.error("Error al obtener las Fees Pendientes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
