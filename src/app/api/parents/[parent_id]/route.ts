// app/api/parents/[parent_id]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { parent_id: string } }) {
  const { parent_id } = params;

  // Parse parent_id as an integer
  const id = parseInt(parent_id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID de padre inválido.' }, { status: 400 });
  }

  try {
    const parent = await prisma.parent.findUnique({
      where: { parent_id: id }, // Use `parent_id` here
    });

    if (!parent) {
      return NextResponse.json({ error: 'Padre no encontrado.' }, { status: 404 });
    }

    return NextResponse.json(parent, { status: 200 });
  } catch (error) {
    console.error('Error al obtener el padre:', error);
    return NextResponse.json({ error: 'Error al obtener el padre.' }, { status: 500 });
  }
}


export async function PUT(request: NextRequest, { params }: { params: { parent_id: string } }) {
    const { parent_id } = params;
    const id = parseInt(parent_id, 10);
  
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID de padre inválido.' }, { status: 400 });
    }
  
    try {
      const body = await request.json();
      const { name, email, phone, address } = body;
  
      // Perform the update with Prisma
      const updatedParent = await prisma.parent.update({
        where: { parent_id: id },
        data: { name, email, phone, address },
      });
  
      return NextResponse.json(updatedParent, { status: 200 });
    } catch (error) {
      console.error('Error al actualizar el padre:', error);
      return NextResponse.json({ error: 'Error al actualizar el padre.' }, { status: 500 });
    }
  }


  export async function DELETE(request: NextRequest, { params }: { params: { parent_id: string } }) {
    const { parent_id } = params;
    const id = parseInt(parent_id, 10);
  
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID de padre inválido.' }, { status: 400 });
    }
  
    try {
      // Perform the deletion with Prisma
      await prisma.parent.delete({
        where: { parent_id: id },
      });
  
      return NextResponse.json({ message: 'Padre eliminado exitosamente.' }, { status: 200 });
    } catch (error) {
      console.error('Error al eliminar el padre:', error);
      return NextResponse.json({ error: 'Error al eliminar el padre.' }, { status: 500 });
    }
  }
