// app/api/payments/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;


    const paymentId = searchParams.get('payment_id') || undefined;
    const parentId = searchParams.get('parent_id') || undefined;
    const feeId = searchParams.get('fee_id') || undefined;
    const status = searchParams.get('status') || undefined;
    const paymentMethod = searchParams.get('payment_method') || undefined;
    const minAmount = searchParams.get('min_amount') || undefined;
    const maxAmount = searchParams.get('max_amount') || undefined;
    const dateFrom = searchParams.get('date_from') || undefined;
    const dateTo = searchParams.get('date_to') || undefined;


    const sortBy = searchParams.get('sort_by') || 'payment_id';
    const sortOrder = searchParams.get('sort_order') || 'asc';


    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    console.log(`Page: ${page}, Limit: ${limit}, Skip: ${skip}`);
    console.log(`Sort By: ${sortBy}, Sort Order: ${sortOrder}`);


    const where: any = {};

    if (paymentId) {
      const paymentIdInt = parseInt(paymentId, 10);
      if (!isNaN(paymentIdInt)) {
        where.payment_id = paymentIdInt;
      }
    }

    if (parentId) {
      const parentIdInt = parseInt(parentId, 10);
      if (!isNaN(parentIdInt)) {
        where.parent_id = parentIdInt;
      }
    }

    if (feeId) {
      const feeIdInt = parseInt(feeId, 10);
      if (!isNaN(feeIdInt)) {
        where.fee_id = feeIdInt;
      }
    }

    if (status) {
      where.status = status;
    }

    if (paymentMethod) {
      where.payment_method = paymentMethod;
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

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (!isNaN(fromDate.getTime())) {
          where.date.gte = fromDate;
        }
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        if (!isNaN(toDate.getTime())) {
          where.date.lte = toDate;
        }
      }
    }

    console.log('Filtros aplicados:', where);


    const sortableFields = ['payment_id', 'parent_id', 'fee_id', 'amount', 'date', 'status', 'payment_method'];
    if (!sortableFields.includes(sortBy)) {
      console.error(`El campo de ordenamiento '${sortBy}' no es válido.`);
      return NextResponse.json(
        { error: `El campo de ordenamiento '${sortBy}' no es válido.` },
        { status: 400 }
      );
    }


    const order: any = {};
    if (sortOrder !== 'asc' && sortOrder !== 'desc') {
      console.error(`El orden '${sortOrder}' no es válido.`);
      return NextResponse.json(
        { error: `El orden '${sortOrder}' no es válido. Use 'asc' o 'desc'.` },
        { status: 400 }
      );
    }
    order[sortBy] = sortOrder;

    console.log(`Orden aplicado:`, order);


    const [payments, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where,
        orderBy: order,
        skip,
        take: limit,
        include: {
          parent: true,
          fee: true,
        },
      }),
      prisma.payment.count({
        where,
      }),
    ]);

    console.log(`Pagos encontrados: ${payments.length}`);
    console.log(`Total de pagos: ${total}`);

    return NextResponse.json(
      {
        data: payments,
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
    console.error("Error al obtener los pagos:", error);
    return NextResponse.json(
      { error: "Error al obtener los pagos." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parent_id, fee_id, amount, status, payment_method } = body;


    if (
      parent_id === undefined ||
      fee_id === undefined ||
      amount === undefined ||
      status === undefined ||
      payment_method === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "parent_id, fee_id, amount, status y payment_method son requeridos.",
        },
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


    const feeExists = await prisma.fee.findUnique({
      where: { fee_id: fee_id },
    });

    if (!feeExists) {
      return NextResponse.json(
        { error: "La cuota asociada no existe." },
        { status: 400 }
      );
    }


    const result = await prisma.$transaction(async (prisma) => {

      const newPayment = await prisma.payment.create({
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


      const totalPayments = await prisma.payment.aggregate({
        where: { fee_id: fee_id },
        _sum: { amount: true },
      });

      const totalPaid = totalPayments._sum.amount || 0;
      const feeAmount = feeExists.amount;


      const isPaid = totalPaid >= feeAmount;


      if (feeExists.is_paid !== isPaid) {
        await prisma.fee.update({
          where: { fee_id: fee_id },
          data: { is_paid: isPaid },
        });
      }


      return newPayment;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error al crear el pago:", error);
    return NextResponse.json(
      { error: "Error al crear el pago." },
      { status: 500 }
    );
  }
}
