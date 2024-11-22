// app/api/vouchers/[id]/route.ts

import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

interface Params {
  params: { id: string };
}

export async function GET(request: Request, { params }: Params) {
  const id = Number(params.id);
  try {
    const voucher = await prisma.voucher.findUnique({
      where: { id },
      include: { items: true, fotos: true },
    });
    if (!voucher) {
      return NextResponse.json(
        { error: 'Voucher no encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(voucher);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener voucher' },
      { status: 500 }
    );
  }
}


export async function PUT(request: Request, { params }: Params) {
    const id = Number(params.id);
    const data = await request.json();
    try {
      const voucher = await prisma.voucher.update({
        where: { id },
        data,
      });
      return NextResponse.json(voucher);
    } catch (error) {
      return NextResponse.json(
        { error: 'Error al actualizar voucher' },
        { status: 500 }
      );
    }
  }

  export async function DELETE(request: Request, { params }: Params) {
    const id = Number(params.id);
    try {
      await prisma.voucher.delete({ where: { id } });
      return NextResponse.json({ message: 'Voucher eliminado' });
    } catch (error) {
      return NextResponse.json(
        { error: 'Error al eliminar voucher' },
        { status: 500 }
      );
    }
  }
  
  