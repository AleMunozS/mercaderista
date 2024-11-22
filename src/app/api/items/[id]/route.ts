// src/app/api/items/[id]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: { id: string };
}

// Obtener un item por ID
export async function GET(request: Request, { params }: Params) {
  const id = Number(params.id);
  try {
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        voucherLines: { include: { voucher: true } }, // Incluir VoucherLines y sus Vouchers
      },
    });
    if (!item) {
      return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener item' }, { status: 500 });
  }
}

// Actualizar un item por ID
export async function PUT(request: Request, { params }: Params) {
  const id = Number(params.id);
  const { nombre, itemCode } = await request.json();

  try {
    // Verificar si el nuevo itemCode ya está en uso por otro item
    const existingItem = await prisma.item.findUnique({
      where: { itemCode },
    });

    if (existingItem && existingItem.id !== id) {
      return NextResponse.json(
        { error: 'El código del item ya está en uso por otro item.' },
        { status: 400 }
      );
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: { nombre, itemCode },
    });
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al actualizar item' }, { status: 500 });
  }
}

// Eliminar un item por ID
export async function DELETE(request: Request, { params }: Params) {
  const id = Number(params.id);
  try {
    // Antes de eliminar, verificar si el item está asociado a alguna VoucherLine
    const associatedVoucherLines = await prisma.voucherLine.findMany({
      where: { itemId: id },
    });

    if (associatedVoucherLines.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el item porque está asociado a VoucherLines.' },
        { status: 400 }
      );
    }

    await prisma.item.delete({ where: { id } });
    return NextResponse.json({ message: 'Item eliminado' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al eliminar item' }, { status: 500 });
  }
}
