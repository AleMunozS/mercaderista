import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

interface Params {
  params: { id: string };
}

// Obtener una foto por ID
export async function GET(request: Request, { params }: Params) {
  const id = Number(params.id);
  try {
    const foto = await prisma.foto.findUnique({ where: { id } });
    if (!foto) {
      return NextResponse.json({ error: 'Foto no encontrada' }, { status: 404 });
    }
    return NextResponse.json(foto);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener foto' }, { status: 500 });
  }
}

// Actualizar una foto por ID
export async function PUT(request: Request, { params }: Params) {
  const id = Number(params.id);
  const data = await request.json();
  try {
    const foto = await prisma.foto.update({ where: { id }, data });
    return NextResponse.json(foto);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar foto' }, { status: 500 });
  }
}

// Eliminar una foto por ID
export async function DELETE(request: Request, { params }: Params) {
  const id = Number(params.id);
  try {
    await prisma.foto.delete({ where: { id } });
    return NextResponse.json({ message: 'Foto eliminada' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar foto' }, { status: 500 });
  }
}
