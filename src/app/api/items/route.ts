import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


function cors(request: Request) {
  const origin = request.headers.get('origin') || '*';

  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Max-Age', '86400'); // Cache para preflight

  return headers;
}


export async function OPTIONS(request: Request) {
  const headers = cors(request);
  return new NextResponse(null, { status: 204, headers });
}

// Obtener todos los items con sus VoucherLines y aplicar filtros de búsqueda
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const nombre = url.searchParams.get('nombre');
    const itemCode = url.searchParams.get('itemCode');
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
    if (itemCode) {
      where.itemCode = {
        contains: itemCode,
        mode: 'insensitive',
      };
    }

    // Calcular el total de registros sin paginación
    const totalItems = await prisma.item.count({ where });

    // Obtener los items con paginación y ordenación
    const items = await prisma.item.findMany({
      where,
      include: { voucherLines: { include: { voucher: true } } },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Construir la respuesta con paginación
    return new NextResponse(
      JSON.stringify({
        data: items,
        pagination: {
          page,
          limit,
          total: totalItems,
        },
      }),
      { status: 200, headers: cors(request) }
    );
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: 'Error al obtener items' }),
      { status: 500, headers: cors(request) }
    );
    
  }
}


export async function POST(request: Request) {
  const { nombre, itemCode, voucherId, cantidad, precio } = await request.json();

  try {
    
    const item = await prisma.item.upsert({
      where: { itemCode },
      update: { nombre }, 
      create: { nombre, itemCode },
    });


    return new NextResponse(
      JSON.stringify({ item }),
      { status: 201, headers: cors(request) }
    );
    
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: 'Error al crear item o voucher line' }),
      { status: 500, headers: cors(request) }
    );
    
  }
}
