import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Obtener todos los vouchers con sus relaciones
export async function GET() {
  try {
    const vouchers = await prisma.voucher.findMany({
      include: {
        usuario: true,
        local: true,
        voucherLines: { include: { item: true } }, // Incluye las líneas del voucher y los items asociados
        fotos: true,
      },
    });

    return NextResponse.json(vouchers);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error al obtener vouchers' },
      { status: 500 }
    );
  }
}

// Crear un nuevo voucher
export async function POST(request: Request) {
  const { tipo, usuarioId, localId, voucherLines, fotos } = await request.json();

  try {
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
    let validVoucherLines = [];
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

    // Crear el voucher
    const voucher = await prisma.voucher.create({
      data: {
        tipo,
        usuarioId,
        localId,
        voucherLines: {
          create: validVoucherLines, // Crear las líneas validadas
        },
        fotos: fotos ? { create: fotos } : undefined, // Crear las fotos si se proporcionan
      },
      include: {
        usuario: true,
        local: true,
        voucherLines: { include: { item: true } },
        fotos: true,
      },
    });

    return NextResponse.json(voucher);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error al crear voucher' },
      { status: 500 }
    );
  }
}
