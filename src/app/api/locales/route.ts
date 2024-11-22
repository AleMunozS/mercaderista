import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

// Obtener todos los locales
export async function GET() {
  try {
    const locales = await prisma.local.findMany();
    return NextResponse.json(locales);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener locales' }, { status: 500 });
  }
}

// Crear un nuevo local
export async function POST(request: Request) {
  const data = await request.json();
  try {
    const local = await prisma.local.create({ data });
    return NextResponse.json(local);
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear local' }, { status: 500 });
  }
}
