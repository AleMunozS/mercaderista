// app/api/usuarios/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parámetros de filtrado
    const idParam = searchParams.get('id');
    const nombre = searchParams.get('nombre') || undefined;
    const email = searchParams.get('email') || undefined;
    const roles = searchParams.get('roles') || undefined;

    // Parámetros de ordenación
    const sortBy = searchParams.get('sortBy') || 'id';
    const sortOrder = searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc';

    // Parámetros de paginación
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Construir el objeto de filtros
    const where: any = {};

    // Manejar el filtro por ID
    if (idParam) {
      const id = parseInt(idParam, 10);
      if (!isNaN(id)) {
        where.id = id;
      } else {
        return NextResponse.json(
          { error: 'El parámetro ID debe ser un número válido.' },
          { status: 400 }
        );
      }
    }

    if (nombre) {
      where.nombre = { contains: nombre, mode: 'insensitive' };
    }
    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }
    if (roles) {
      where.roles = { contains: roles, mode: 'insensitive' };
    }

    // Validar el campo sortBy
    const allowedSortFields = ['id', 'nombre', 'email', 'roles'];
    if (!allowedSortFields.includes(sortBy)) {
      return NextResponse.json(
        { error: `El campo de ordenación "${sortBy}" no es válido.` },
        { status: 400 }
      );
    }

    // Obtener total de usuarios para la paginación
    const total = await prisma.usuario.count({ where });

    // Obtener usuarios con filtros, orden y paginación
    const usuarios = await prisma.usuario.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        email: true,
        roles: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      data: usuarios,
      pagination: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    console.error(error);
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
    console.error(error);
    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 }
    );
  }
}
