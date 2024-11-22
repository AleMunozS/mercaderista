import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        roles: true,
        
      },
    }); // No incluimos contraseñas en la respuesta por seguridad
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
    // Validamos que el campo contraseña exista
    if (!data.password) {
      return NextResponse.json(
        { error: 'La contraseña es requerida.' },
        { status: 400 }
      );
    }

    // Hasheamos la contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Reemplazamos la contraseña en el objeto data por la versión encriptada
    const usuario = await prisma.usuario.create({
      data: {
        ...data,
        password: hashedPassword, // Guardamos la contraseña encriptada
      },
    });

    // No retornamos la contraseña en la respuesta
    const { password, ...usuarioSinPassword } = usuario;

    return NextResponse.json(usuarioSinPassword);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 }
    );
  }
}
