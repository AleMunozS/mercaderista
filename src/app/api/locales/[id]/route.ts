import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

interface Params {
  params: { id: string };
}

// Obtener un local por ID
export async function GET(request: Request, { params }: Params) {
  const id = Number(params.id);
  try {
    const local = await prisma.local.findUnique({ where: { id } });
    if (!local) {
      return NextResponse.json({ error: 'Local no encontrado' }, { status: 404 });
    }
    return NextResponse.json(local);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener local' }, { status: 500 });
  }
}

// Actualizar un local por ID
export async function PUT(request: Request, { params }: Params) {
  const id = Number(params.id);
  const data = await request.json();
  try {
    const local = await prisma.local.update({ where: { id }, data });
    return NextResponse.json(local);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar local' }, { status: 500 });
  }
}

// Eliminar un local por ID
export async function DELETE(request: Request, { params }: Params) {
  const id = Number(params.id);
  try {
    await prisma.local.delete({ where: { id } });
    return NextResponse.json({ message: 'Local eliminado' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar local' }, { status: 500 });
  }
}
