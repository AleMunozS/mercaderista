import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

// Obtener todos los locales
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const nombre = url.searchParams.get('nombre');
    const direccion = url.searchParams.get('direccion');
    const supermercado = url.searchParams.get('supermercado');
    const sortBy = url.searchParams.get('sortBy') || 'id';
    const sortOrder = url.searchParams.get('sortOrder') || 'asc';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    // Construir el objeto 'where' dinámicamente según los parámetros proporcionados
    const where: any = {};

    if (id) {
      where.id = Number(id);
    }
    if (nombre) {
      where.nombre = {
        contains: nombre,
        mode: 'insensitive',
      };
    }
    if (direccion) {
      where.direccion = {
        contains: direccion,
        mode: 'insensitive',
      };
    }
    if (supermercado) {
      where.supermercado = {
        contains: supermercado,
        mode: 'insensitive',
      };
    }

    // Calcular el total de registros sin paginación
    const totalLocales = await prisma.local.count({ where });

    // Obtener los locales con paginación y ordenación
    const locales = await prisma.local.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Construir la respuesta con paginación
    return NextResponse.json({
      data: locales,
      pagination: {
        page,
        limit,
        total: totalLocales,
      },
    });
  } catch (error) {
    console.error(error);
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
