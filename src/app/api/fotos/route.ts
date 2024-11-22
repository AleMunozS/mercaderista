import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

// Obtener todas las fotos
export async function GET() {
  try {
    const fotos = await prisma.foto.findMany();
    return NextResponse.json(fotos);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener fotos' }, { status: 500 });
  }
}

// Crear una nueva foto
export async function POST(request: Request) {
  const data = await request.json();
  try {
    const foto = await prisma.foto.create({ data });
    return NextResponse.json(foto);
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear foto' }, { status: 500 });
  }
}
