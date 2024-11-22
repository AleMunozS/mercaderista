// src/app/api/asistencias/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  try {
    const asistencias = await prisma.asistencia.findMany({
      take: limit,
      orderBy: {
        checkInTime: 'desc',
      },
      include: {
        usuario: true,
        local: true,
      },
    });
    return NextResponse.json(asistencias);
  } catch (error) {
    console.error("Error al obtener asistencias:", error);
    return NextResponse.json(
      { error: 'Error al obtener asistencias' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const data = await request.json();
  try {
    const asistencia = await prisma.asistencia.create({
      data,
    });
    return NextResponse.json(asistencia);
  } catch (error) {
    console.error("Error al crear asistencia:", error);
    return NextResponse.json(
      { error: 'Error al crear asistencia' },
      { status: 500 }
    );
  }
}
