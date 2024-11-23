// src/app/api/asistencias/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Especificar el runtime para asegurar que se ejecute en Node.js
export const runtime = 'nodejs';

// Función para agregar encabezados CORS
function cors(request: NextRequest) {
  const origin = request.headers.get('origin') || '*';

  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Max-Age', '86400'); // Opcional: cachea la respuesta preflight por 24 horas

  return headers;
}

// Manejo del método OPTIONS para solicitudes preflight
export async function OPTIONS(request: NextRequest) {
  const headers = cors(request);
  return new NextResponse(null, { status: 204, headers });
}

// Método GET
export async function GET(request: NextRequest) {
  const headers = cors(request);

  const { searchParams } = new URL(request.url);

  try {
    // Extraer parámetros de búsqueda
    const id = searchParams.get('id');
    const usuarioNombre = searchParams.get('usuarioNombre');
    const localNombre = searchParams.get('localNombre');
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');
    const sortBy = searchParams.get('sortBy') || 'checkInTime';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Construir el objeto 'where' dinámicamente según los parámetros proporcionados
    const where: any = {};

    if (id) {
      where.id = Number(id);
    }
    if (usuarioNombre) {
      where.usuario = {
        nombre: {
          contains: usuarioNombre,
          mode: 'insensitive',
        },
      };
    }
    if (localNombre) {
      where.local = {
        nombre: {
          contains: localNombre,
          mode: 'insensitive',
        },
      };
    }
    if (fechaDesde && fechaHasta) {
      where.checkInTime = {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta),
      };
    } else if (fechaDesde) {
      where.checkInTime = {
        gte: new Date(fechaDesde),
      };
    } else if (fechaHasta) {
      where.checkInTime = {
        lte: new Date(fechaHasta),
      };
    }

    // Campos permitidos para ordenación
    const allowedSortFields = [
      'id',
      'checkInTime',
      'checkOutTime',
      'usuario.nombre',
      'local.nombre',
    ];

    // Validar 'sortBy' y construir el objeto 'orderBy'
    let orderBy: any = {};
    if (allowedSortFields.includes(sortBy)) {
      if (sortBy === 'usuario.nombre') {
        orderBy = {
          usuario: {
            nombre: sortOrder,
          },
        };
      } else if (sortBy === 'local.nombre') {
        orderBy = {
          local: {
            nombre: sortOrder,
          },
        };
      } else {
        orderBy = {
          [sortBy]: sortOrder,
        };
      }
    } else {
      // Valor por defecto
      orderBy = {
        checkInTime: 'desc',
      };
    }

    // Obtener el total de registros sin paginación
    const totalAsistencias = await prisma.asistencia.count({ where });

    // Obtener las asistencias con paginación y ordenación
    const asistencias = await prisma.asistencia.findMany({
      where,
      include: {
        usuario: true,
        local: true,
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    // Construir la respuesta con paginación
    return new NextResponse(
      JSON.stringify({
        data: asistencias,
        pagination: {
          page,
          limit,
          total: totalAsistencias,
        },
      }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error('Error al obtener asistencias:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Error al obtener asistencias' }),
      { status: 500, headers }
    );
  }
}

// Método POST
export async function POST(request: NextRequest) {
  const headers = cors(request);

  try {
    const data = await request.json();
    const asistencia = await prisma.asistencia.create({
      data,
    });
    return new NextResponse(JSON.stringify(asistencia), {
      status: 201,
      headers,
    });
  } catch (error) {
    console.error('Error al crear asistencia:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Error al crear asistencia' }),
      { status: 500, headers }
    );
  }
}
