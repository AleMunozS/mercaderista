import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

// Obtener todos los eventos
export async function GET() {
  try {
    const eventos = await prisma.evento.findMany({
      include: { usuario: true },
    });
    return NextResponse.json(eventos);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener eventos' }, { status: 500 });
  }
}

// Crear un nuevo evento
export async function POST(request: Request) {
  const data = await request.json();
  try {
    const evento = await prisma.evento.create({ data });
    return NextResponse.json(evento);
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear evento' }, { status: 500 });
  }
}
