import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

interface Params {
  params: { id: string };
}

// Obtener un evento por ID
export async function GET(request: Request, { params }: Params) {
  const id = Number(params.id);
  try {
    const evento = await prisma.evento.findUnique({
      where: { id },
      include: { usuario: true },
    });
    if (!evento) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }
    return NextResponse.json(evento);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener evento' }, { status: 500 });
  }
}

// Actualizar un evento por ID
export async function PUT(request: Request, { params }: Params) {
  const id = Number(params.id);
  const data = await request.json();
  try {
    const evento = await prisma.evento.update({ where: { id }, data });
    return NextResponse.json(evento);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar evento' }, { status: 500 });
  }
}

// Eliminar un evento por ID
export async function DELETE(request: Request, { params }: Params) {
  const id = Number(params.id);
  try {
    await prisma.evento.delete({ where: { id } });
    return NextResponse.json({ message: 'Evento eliminado' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar evento' }, { status: 500 });
  }
}
