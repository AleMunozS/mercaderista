// app/api/eventos/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Especificar el runtime para asegurar que se ejecute en Node.js (opcional)
export const runtime = 'nodejs';

// Función para agregar encabezados CORS
function cors(request: NextRequest) {
  const origin = request.headers.get('origin') || '*';

  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Max-Age', '86400'); // Opcional: cachea la respuesta preflight por 24 horas

  return headers;
}

// Manejo del método OPTIONS para solicitudes preflight
export async function OPTIONS(request: NextRequest) {
  const headers = cors(request);
  return new NextResponse(null, { status: 204, headers });
}

// Definir tipos para los posibles parámetros de búsqueda, ordenamiento y paginación
interface EventoQueryParams {
  id?: string;
  usuarioId?: string;
  mensaje?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  sortBy: string; // Campo por el cual ordenar, ahora obligatorio
  sortOrder: 'asc' | 'desc'; // Orden ascendente o descendente, ahora obligatorio
  page: number; // Número de página, ahora obligatorio
  limit: number; // Número de elementos por página, ahora obligatorio
}

// Método GET
export async function GET(request: NextRequest) {
  const headers = cors(request);

  try {
    // Extraer los parámetros de consulta
    const { searchParams } = new URL(request.url);
    const query: EventoQueryParams = {
      id: searchParams.get('id') || undefined,
      usuarioId: searchParams.get('usuarioId') || undefined,
      mensaje: searchParams.get('mensaje') || undefined,
      createdAtFrom: searchParams.get('createdAtFrom') || undefined,
      createdAtTo: searchParams.get('createdAtTo') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt', // Valor por defecto
      sortOrder: searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc', // Valor por defecto
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1, // Valor por defecto
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 10, // Valor por defecto
    };

    // Construir el objeto de filtros
    const where: any = {};

    if (query.id) {
      const idNum = Number(query.id);
      if (!isNaN(idNum)) {
        where.id = idNum;
      }
    }

    if (query.usuarioId) {
      const usuarioIdNum = Number(query.usuarioId);
      if (!isNaN(usuarioIdNum)) {
        where.usuarioId = usuarioIdNum;
      }
    }

    if (query.mensaje) {
      // Usar contains para búsqueda parcial (case-insensitive)
      where.mensaje = {
        contains: query.mensaje,
        mode: 'insensitive',
      };
    }

    if (query.createdAtFrom || query.createdAtTo) {
      where.createdAt = {};
      if (query.createdAtFrom) {
        where.createdAt.gte = new Date(query.createdAtFrom);
      }
      if (query.createdAtTo) {
        where.createdAt.lte = new Date(query.createdAtTo);
      }
    }

    // Construir el objeto de ordenamiento
    const orderBy: any = {};
    const sortableFields = ['id', 'usuarioId', 'mensaje', 'createdAt'];

    if (query.sortBy.includes('.')) {
      const [relation, field] = query.sortBy.split('.');
      if (relation === 'usuario') {
        orderBy[relation] = { [field]: query.sortOrder };
      }
    } else if (sortableFields.includes(query.sortBy)) {
      orderBy[query.sortBy] = query.sortOrder;
    } else {
      // Campo de ordenamiento por defecto
      orderBy['createdAt'] = 'asc';
    }

    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    // Ejecutar la consulta con filtros, ordenamiento y paginación
    const eventos = await prisma.evento.findMany({
      where,
      orderBy,
      include: { usuario: true },
      skip,
      take,
    });

    // Obtener el total de eventos para la paginación
    const total = await prisma.evento.count({ where });

    return new NextResponse(
      JSON.stringify({
        data: eventos,
        pagination: {
          total,
          page: query.page,
          limit: query.limit,
          totalPages: Math.ceil(total / query.limit),
        },
      }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Error al obtener eventos' }),
      { status: 500, headers }
    );
  }
}

// Función para manejar la solicitud POST (crear un nuevo evento)
export async function POST(request: NextRequest) {
  const headers = cors(request);

  try {
    const data = await request.json();

    // Validar los datos de entrada según tu modelo (opcional pero recomendado)
    // Por ejemplo, asegurarse de que usuarioId exista, mensaje no esté vacío, etc.

    const evento = await prisma.evento.create({ data });
    return new NextResponse(JSON.stringify(evento), { status: 201, headers });
  } catch (error) {
    console.error('Error al crear evento:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Error al crear evento' }),
      { status: 500, headers }
    );
  }
}

// (Opcional) Si necesitas manejar otros métodos como PUT o DELETE, puedes agregarlos de manera similar
