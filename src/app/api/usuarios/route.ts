// app/api/usuarios/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany();
    return NextResponse.json(usuarios);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
    const data = await request.json();
    try {
      const usuario = await prisma.usuario.create({ data });
      return NextResponse.json(usuario);
    } catch (error) {
      return NextResponse.json(
        { error: 'Error al crear usuario' },
        { status: 500 }
      );
    }
  }
  
