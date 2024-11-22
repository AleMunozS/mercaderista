import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Obtener todos los items con sus VoucherLines
export async function GET() {
  try {
    const items = await prisma.item.findMany({
      include: { voucherLines: { include: { voucher: true } } }, // Incluye las VoucherLines y los Voucher relacionados
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener items' }, { status: 500 });
  }
}

// Crear un nuevo item y asociarlo con un Voucher a través de VoucherLine
export async function POST(request: Request) {
  const { nombre, itemCode, voucherId, cantidad, precio } = await request.json();

  try {
    // Primero, crea el item si no existe (o busca uno existente basado en `itemCode`)
    const item = await prisma.item.upsert({
      where: { itemCode },
      update: { nombre }, // Actualiza el nombre si el item ya existe
      create: { nombre, itemCode },
    });

    // Luego, crea la relación en VoucherLine
    

    return NextResponse.json({ item});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al crear item o voucher line' }, { status: 500 });
  }
}
