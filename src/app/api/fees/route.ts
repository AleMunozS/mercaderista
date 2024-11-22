// app/api/fees/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const feeId = searchParams.get('fee_id') || undefined;
    const description = searchParams.get('description') || undefined;
    const studentName = searchParams.get('student_name') || undefined;
    const studentId = searchParams.get('student_id') || undefined;
    const minAmount = searchParams.get('min_amount') || undefined;
    const maxAmount = searchParams.get('max_amount') || undefined;
    const dueDateFrom = searchParams.get('due_date_from') || undefined;
    const dueDateTo = searchParams.get('due_date_to') || undefined;
    const isPaidParam = searchParams.get('is_paid') || undefined;

    const sortBy = searchParams.get('sort_by') || 'fee_id';
    const sortOrder = searchParams.get('sort_order') || 'asc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    console.log(`Page: ${page}, Limit: ${limit}, Skip: ${skip}`);
    console.log(`Sort By: ${sortBy}, Sort Order: ${sortOrder}`);

    const where: any = {};

    if (feeId) {
      const feeIdInt = parseInt(feeId, 10);
      if (!isNaN(feeIdInt)) {
        where.fee_id = feeIdInt;
      }
    }

    if (description) {
      where.description = {
        contains: description,
        mode: 'insensitive',
      };
    }

    if (studentName) {
      where.student = {
        name: {
          contains: studentName,
          mode: 'insensitive',
        },
      };
    }

    if (studentId) {
      const studentIdInt = parseInt(studentId, 10);
      if (!isNaN(studentIdInt)) {
        where.student_id = studentIdInt;
      }
    }

    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) {
        const min = parseFloat(minAmount);
        if (!isNaN(min)) {
          where.amount.gte = min;
        }
      }
      if (maxAmount) {
        const max = parseFloat(maxAmount);
        if (!isNaN(max)) {
          where.amount.lte = max;
        }
      }
    }

    if (dueDateFrom || dueDateTo) {
      where.due_date = {};
      if (dueDateFrom) {
        const fromDate = new Date(dueDateFrom);
        if (!isNaN(fromDate.getTime())) {
          where.due_date.gte = fromDate;
        }
      }
      if (dueDateTo) {
        const toDate = new Date(dueDateTo);
        if (!isNaN(toDate.getTime())) {
          where.due_date.lte = toDate;
        }
      }
    }


    if (isPaidParam !== undefined) {
      if (isPaidParam === 'true') {
        where.is_paid = true;
      } else if (isPaidParam === 'false') {
        where.is_paid = false;
      } else {
        return NextResponse.json(
          { error: `El valor de 'is_paid' debe ser 'true' o 'false'.` },
          { status: 400 }
        );
      }
    }

    console.log('Filtros aplicados:', where);


    const sortableFields = ['fee_id', 'description', 'amount', 'due_date', 'student_name', 'is_paid'];
    if (!sortableFields.includes(sortBy)) {
      return NextResponse.json(
        { error: `El campo de ordenamiento '${sortBy}' no es válido.` },
        { status: 400 }
      );
    }

    if (sortOrder !== 'asc' && sortOrder !== 'desc') {
      return NextResponse.json(
        { error: `El orden '${sortOrder}' no es válido. Use 'asc' o 'desc'.` },
        { status: 400 }
      );
    }

    const order: any = {};
    if (sortBy === 'student_name') {
      order.student = { name: sortOrder };
    } else {
      order[sortBy] = sortOrder;
    }

    console.log(`Orden aplicado:`, order);

    const [fees, total] = await prisma.$transaction([
      prisma.fee.findMany({
        where,
        orderBy: order,
        skip,
        take: limit,
        include: {
          student: {
            include: {
              parent: true,
            },
          },
          payments: true,
        },
      }),
      prisma.fee.count({
        where,
      }),
    ]);

    console.log(`Cuotas encontradas: ${fees.length}`);
    console.log(`Total de cuotas: ${total}`);


    const feesWithPaymentStatus = fees.map(fee => {
      const totalPaid = fee.payments.reduce((sum, payment) => sum + payment.amount, 0);
      const remainingAmount = fee.amount - totalPaid;

      return {
        ...fee,
        total_paid: totalPaid,
        remaining_amount: remainingAmount > 0 ? remainingAmount : 0,

        is_paid: fee.is_paid,
      };
    });

    return NextResponse.json(
      {
        data: feesWithPaymentStatus,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al obtener las cuotas:', error);
    return NextResponse.json({ error: 'Error al obtener las cuotas.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, amount, due_date, student_id } = body;

    if (!description || !amount || !due_date || !student_id) {
      return NextResponse.json(
        { error: 'Descripción, monto, fecha de vencimiento y student_id son requeridos.' },
        { status: 400 }
      );
    }

    const studentExists = await prisma.student.findUnique({
      where: { student_id: student_id },
    });

    if (!studentExists) {
      return NextResponse.json(
        { error: 'El estudiante asociado no existe.' },
        { status: 400 }
      );
    }

    const newFee = await prisma.fee.create({
      data: {
        description,
        amount,
        due_date: new Date(due_date),
        student_id,
        is_paid: false,
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

    return NextResponse.json(newFee, { status: 201 });
  } catch (error) {
    console.error('Error al crear la cuota:', error);
    return NextResponse.json({ error: 'Error al crear la cuota.' }, { status: 500 });
  }
}
