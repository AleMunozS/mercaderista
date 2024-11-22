// src/app/api/dashboard/summary/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalUsuarios = await prisma.usuario.count();
    const totalLocales = await prisma.local.count();
    const totalVouchers = await prisma.voucher.count();
    const totalEventos = await prisma.evento.count();

    const summary = {
      totalUsuarios,
      totalLocales,
      totalVouchers,
      totalEventos,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error al obtener el resumen del dashboard:", error);
    return NextResponse.json(
      { error: 'Error al obtener el resumen del dashboard' },
      { status: 500 }
    );
  }
}
