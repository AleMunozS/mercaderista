// app/api/locales/route.ts (suponiendo que estás usando la estructura de 'app' en Next.js 13+)
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Especifica el runtime
export const runtime = 'nodejs';

// Middleware de CORS
function cors(request: NextRequest) {
  const origin = request.headers.get('origin') || '*';

  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Max-Age', '86400'); // Opcional

  return headers;
}

export async function OPTIONS(request: NextRequest) {
  // Maneja las solicitudes OPTIONS para CORS preflight
  const headers = cors(request);
  return new NextResponse(null, { status: 204, headers });
}

export async function GET(request: NextRequest) {
  const headers = cors(request);

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const nombre = searchParams.get('nombre');
    const direccion = searchParams.get('direccion');
    const supermercado = searchParams.get('supermercado');
    const sortBy = searchParams.get('sortBy') || 'id';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

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

    const totalLocales = await prisma.local.count({ where });

    const locales = await prisma.local.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return new NextResponse(
      JSON.stringify({
        data: locales,
        pagination: {
          page,
          limit,
          total: totalLocales,
        },
      }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: 'Error al obtener locales' }),
      {
        status: 500,
        headers,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  const headers = cors(request);

  try {
    const data = await request.json();
    const local = await prisma.local.create({ data });
    return new NextResponse(JSON.stringify(local), {
      status: 201,
      headers,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: 'Error al crear local' }),
      {
        status: 500,
        headers,
      }
    );
  }
}
