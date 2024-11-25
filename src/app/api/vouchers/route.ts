import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Middleware para configurar CORS
function configureCORS(request: Request) {
  const origin = request.headers.get('origin') || '*';

  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Max-Age', '86400'); // Cache de preflight por 1 día

  return headers;
}

// Manejo del método OPTIONS para preflight requests
export async function OPTIONS(request: Request) {
  const headers = configureCORS(request);
  return new NextResponse(null, { status: 204, headers });
}

// Obtener todos los vouchers con sus relaciones
export async function GET(request: Request) {
  try {
    const headers = configureCORS(request);
    const url = new URL(request.url);

    // Extraer parámetros de búsqueda
    const id = url.searchParams.get('id');
    const tipo = url.searchParams.get('tipo');
    const usuarioNombre = url.searchParams.get('usuarioNombre');
    const localNombre = url.searchParams.get('localNombre');
    const fechaDesde = url.searchParams.get('fechaDesde');
    const fechaHasta = url.searchParams.get('fechaHasta');
    const sortBy = url.searchParams.get('sortBy') || 'id';
    const sortOrder = url.searchParams.get('sortOrder') || 'asc';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    // Construir el objeto 'where' dinámicamente según los parámetros proporcionados
    const where: any = {};

    if (id) {
      where.id = Number(id);
    }
    if (tipo) {
      where.tipo = {
        equals: tipo,
        mode: 'insensitive',
      };
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
      where.createdAt = {
        gte: new Date(fechaDesde),
        lte: new Date(fechaHasta),
      };
    } else if (fechaDesde) {
      where.createdAt = {
        gte: new Date(fechaDesde),
      };
    } else if (fechaHasta) {
      where.createdAt = {
        lte: new Date(fechaHasta),
      };
    }

    // Campos permitidos para ordenación
    const allowedSortFields = ['id', 'tipo', 'createdAt'];

    // Validar 'sortBy'
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';

    // Obtener el total de registros sin paginación
    const totalVouchers = await prisma.voucher.count({
      where,
    });

    // Obtener los vouchers con paginación y ordenación
    const vouchers = await prisma.voucher.findMany({
      where,
      include: {
        usuario: true,
        local: true,
        voucherLines: { include: { item: true } },
        fotos: true,
      },
      orderBy: {
        [sortField]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Construir la respuesta con paginación
    return NextResponse.json(
      {
        data: vouchers,
        pagination: {
          page,
          limit,
          total: totalVouchers,
        },
      },
      { headers }
    );
  } catch (error) {
    console.error(error);
    const headers = configureCORS(request);
    return NextResponse.json(
      { error: 'Error al obtener vouchers' },
      { status: 500, headers }
    );
  }
}

// Crear un nuevo voucher
export async function POST(request: Request) {
  const headers = configureCORS(request);
  const { tipo, usuarioId, localId, voucherLines, fotos } = await request.json();

  try {
    // Validar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 400, headers }
      );
    }

    // Validar que el local existe
    const local = await prisma.local.findUnique({
      where: { id: localId },
    });
    if (!local) {
      return NextResponse.json(
        { error: 'Local no encontrado' },
        { status: 400, headers }
      );
    }

    // Validar y procesar las voucherLines
    const validVoucherLines = voucherLines?.map(async (line: any) => {
      const { itemId, cantidad, precio } = line;

      // Validar que el item existe
      const item = await prisma.item.findUnique({ where: { id: itemId } });
      if (!item) {
        throw new Error(`Item con ID ${itemId} no encontrado`);
      }

      return { itemId, cantidad, precio };
    }) || [];

    const resolvedVoucherLines = await Promise.all(validVoucherLines);

    // Crear el voucher con las fotos correctamente estructuradas
    const voucher = await prisma.voucher.create({
      data: {
        tipo,
        usuarioId,
        localId,
        voucherLines: {
          create: resolvedVoucherLines,
        },
        fotos: {
          create: fotos.map((foto: string) => ({
            url: foto,
          })),
        },
      },
      include: {
        usuario: true,
        local: true,
        voucherLines: { include: { item: true } },
        fotos: true,
      },
    });

    return NextResponse.json(voucher, { headers });
  } catch (error: any) {
    console.error(error.message || error);
    return NextResponse.json(
      { error: error.message || 'Error al crear voucher' },
      { status: 500, headers }
    );
  }
}


