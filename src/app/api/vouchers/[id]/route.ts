// src/app/api/vouchers/[id]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: { id: string };
}

export async function GET(request: Request, { params }: Params) {
  const id = Number(params.id);
  try {
    const voucher = await prisma.voucher.findUnique({
      where: { id },
      include: {
        usuario: true,
        local: true,
        voucherLines: { include: { item: true } }, // Incluir voucherLines con los items
        fotos: true,
      },
    });
    if (!voucher) {
      return NextResponse.json(
        { error: 'Voucher no encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(voucher);
  } catch (error) {
    console.error(error);
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
    // Validaciones similares a las de la creación
    const { tipo, usuarioId, localId, voucherLines, fotos } = data;

    // Validar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 400 }
      );
    }

    // Validar que el local existe
    const local = await prisma.local.findUnique({
      where: { id: localId },
    });
    if (!local) {
      return NextResponse.json(
        { error: 'Local no encontrado' },
        { status: 400 }
      );
    }

    // Validar y preparar las voucherLines (si se incluyen)
    const validVoucherLines = [];
    if (voucherLines && voucherLines.length > 0) {
      for (const line of voucherLines) {
        const { itemId, cantidad, precio } = line;

        // Validar que el item existe
        const item = await prisma.item.findUnique({
          where: { id: itemId },
        });
        if (!item) {
          return NextResponse.json(
            { error: `Item con ID ${itemId} no encontrado` },
            { status: 400 }
          );
        }

        // Agregar la línea válida
        validVoucherLines.push({ itemId, cantidad, precio });
      }
    }

    // Actualizar el voucher
    const updatedVoucher = await prisma.voucher.update({
      where: { id },
      data: {
        tipo,
        usuarioId,
        localId,
        voucherLines: {
          deleteMany: {}, // Elimina las líneas existentes
          create: validVoucherLines, // Crea las nuevas líneas
        },
        fotos: fotos
          ? {
              deleteMany: {}, // Elimina las fotos existentes
              create: fotos, // Crea las nuevas fotos
            }
          : undefined,
      },
      include: {
        usuario: true,
        local: true,
        voucherLines: { include: { item: true } },
        fotos: true,
      },
    });

    return NextResponse.json(updatedVoucher);
  } catch (error) {
    console.error(error);
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
    console.error(error);
    return NextResponse.json(
      { error: 'Error al eliminar voucher' },
      { status: 500 }
    );
  }
}
