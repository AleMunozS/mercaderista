import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

// Obtener todos los registros de asistencia
export async function GET() {
  try {
    const asistencias = await prisma.asistencia.findMany({
      include: { usuario: true, local: true },
    });
    return NextResponse.json(asistencias);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener asistencias' }, { status: 500 });
  }
}

// Crear un nuevo registro de asistencia
export async function POST(request: Request) {
  const data = await request.json();
  try {
    const asistencia = await prisma.asistencia.create({ data });
    return NextResponse.json(asistencia);
  } catch (error) {
    return NextResponse.json({ error: 'Error al registrar asistencia' }, { status: 500 });
  }
}
