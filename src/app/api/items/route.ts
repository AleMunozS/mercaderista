import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

// Obtener todos los items
export async function GET() {
  try {
    const items = await prisma.item.findMany({ include: { voucher: true } });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener items' }, { status: 500 });
  }
}

// Crear un nuevo item
export async function POST(request: Request) {
  const data = await request.json();
  try {
    const item = await prisma.item.create({ data });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear item' }, { status: 500 });
  }
}
