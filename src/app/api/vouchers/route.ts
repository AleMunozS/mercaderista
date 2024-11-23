import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Obtener todos los vouchers con sus relaciones
// Obtener todos los vouchers con sus relaciones
// Obtener todos los vouchers con sus relaciones
export async function GET(request: Request) {
  try {
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
    return NextResponse.json({
      data: vouchers,
      pagination: {
        page,
        limit,
        total: totalVouchers,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error al obtener vouchers' },
      { status: 500 }
    );
  }
}

// Crear un nuevo voucher
export async function POST(request: Request) {
  const { tipo, usuarioId, localId, voucherLines, fotos } = await request.json();

  try {
    // Validar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 400 }
      );
    }

    // Validar que el local existe
    const local = await prisma.local.findUnique({
      where: { id: localId },
    });
    if (!local) {
      return NextResponse.json(
        { error: 'Local no encontrado' },
        { status: 400 }
      );
    }

    // Validar y preparar las voucherLines (si se incluyen)
    const validVoucherLines = [];
    if (voucherLines && voucherLines.length > 0) {
      for (const line of voucherLines) {
        const { itemId, cantidad, precio } = line;

        // Validar que el item existe
        const item = await prisma.item.findUnique({
          where: { id: itemId },
        });
        if (!item) {
          return NextResponse.json(
            { error: `Item con ID ${itemId} no encontrado` },
            { status: 400 }
          );
        }

        // Agregar la línea válida
        validVoucherLines.push({ itemId, cantidad, precio });
      }
    }

    // Crear el voucher
    const voucher = await prisma.voucher.create({
      data: {
        tipo,
        usuarioId,
        localId,
        voucherLines: {
          create: validVoucherLines, // Crear las líneas validadas
        },
        fotos: fotos ? { create: fotos } : undefined, // Crear las fotos si se proporcionan
      },
      include: {
        usuario: true,
        local: true,
        voucherLines: { include: { item: true } },
        fotos: true,
      },
    });

    return NextResponse.json(voucher);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error al crear voucher' },
      { status: 500 }
    );
  }
}
