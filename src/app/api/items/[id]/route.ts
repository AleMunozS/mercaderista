import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

interface Params {
  params: { id: string };
}

// Obtener un item por ID
export async function GET(request: Request, { params }: Params) {
  const id = Number(params.id);
  try {
    const item = await prisma.item.findUnique({
      where: { id },
      include: { voucher: true },
    });
    if (!item) {
      return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener item' }, { status: 500 });
  }
}

// Actualizar un item por ID
export async function PUT(request: Request, { params }: Params) {
  const id = Number(params.id);
  const data = await request.json();
  try {
    const item = await prisma.item.update({ where: { id }, data });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar item' }, { status: 500 });
  }
}

// Eliminar un item por ID
export async function DELETE(request: Request, { params }: Params) {
  const id = Number(params.id);
  try {
    await prisma.item.delete({ where: { id } });
    return NextResponse.json({ message: 'Item eliminado' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar item' }, { status: 500 });
  }
}
