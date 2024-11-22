import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

interface Params {
  params: { id: string };
}

// Obtener un registro de asistencia por ID
export async function GET(request: Request, { params }: Params) {
  const id = Number(params.id);
  try {
    const asistencia = await prisma.asistencia.findUnique({
      where: { id },
      include: { usuario: true, local: true },
    });
    if (!asistencia) {
      return NextResponse.json({ error: 'Asistencia no encontrada' }, { status: 404 });
    }
    return NextResponse.json(asistencia);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener asistencia' }, { status: 500 });
  }
}

// Actualizar un registro de asistencia por ID
export async function PUT(request: Request, { params }: Params) {
  const id = Number(params.id);
  const data = await request.json();
  try {
    const asistencia = await prisma.asistencia.update({ where: { id }, data });
    return NextResponse.json(asistencia);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar asistencia' }, { status: 500 });
  }
}

// Eliminar un registro de asistencia por ID
export async function DELETE(request: Request, { params }: Params) {
  const id = Number(params.id);
  try {
    await prisma.asistencia.delete({ where: { id } });
    return NextResponse.json({ message: 'Asistencia eliminada' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar asistencia' }, { status: 500 });
  }
}
