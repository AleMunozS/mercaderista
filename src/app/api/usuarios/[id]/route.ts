// app/api/usuarios/[id]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: { id: string };
}

export async function GET(request: Request, { params }: Params) {
  const id = Number(params.id);
  try {
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(usuario);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    );
  }
}


export async function PUT(request: Request, { params }: Params) {
    const id = Number(params.id);
    const data = await request.json();
    try {
      const usuario = await prisma.usuario.update({
        where: { id },
        data,
      });
      return NextResponse.json(usuario);
    } catch (error) {
      return NextResponse.json(
        { error: 'Error al actualizar usuario' },
        { status: 500 }
      );
    }
  }

  export async function DELETE(request: Request, { params }: Params) {
    const id = Number(params.id);
    try {
      await prisma.usuario.delete({ where: { id } });
      return NextResponse.json({ message: 'Usuario eliminado' });
    } catch (error) {
      return NextResponse.json(
        { error: 'Error al eliminar usuario' },
        { status: 500 }
      );
    }
  }
  
  
