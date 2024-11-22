// app/api/vouchers/route.ts

import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

export async function GET() {
  try {
    const vouchers = await prisma.voucher.findMany({
      include: {
        usuario: true,
        local: true,
        items: true,
        fotos: true,
      },
    });
    
    return NextResponse.json(vouchers);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener vouchers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
    const data = await request.json();
    try {
      const voucher = await prisma.voucher.create({ data });
      return NextResponse.json(voucher);
    } catch (error) {
      return NextResponse.json(
        { error: 'Error al crear voucher' },
        { status: 500 }
      );
    }
  }
  
