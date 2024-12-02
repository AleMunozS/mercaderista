// app/api/items/bulk-import/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Función para manejar CORS
function corsHeaders(request: Request) {
  const origin = request.headers.get('origin') || '*';

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // Cache para preflight
  };
}

// Manejo de solicitudes OPTIONS para CORS preflight
export async function OPTIONS(request: Request) {
  const headers = corsHeaders(request);
  return new Response(null, { status: 204, headers });
}

// Manejo de la solicitud POST para importación masiva
export async function POST(request: Request) {
  const headers = corsHeaders(request);

  // Verificar el tipo de contenido
  if (!request.headers.get('Content-Type')?.includes('application/json')) {
    return NextResponse.json(
      { error: 'Content-Type debe ser application/json' },
      { status: 400, headers }
    );
  }

  try {
    const items: Array<{ nombre: string; itemCode: string }> = await request.json();

    // Validar que el payload sea un arreglo
    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'El payload debe ser un arreglo de ítems' },
        { status: 400, headers }
      );
    }

    // Validar cada ítem usando un bucle for tradicional
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      if (!item.nombre || !item.itemCode) {
        return NextResponse.json(
          { error: `El ítem en la posición ${index + 1} está incompleto` },
          { status: 400, headers }
        );
      }
    }

    // Insertar los ítems de manera masiva
    const result = await prisma.item.createMany({
      data: items,
      skipDuplicates: true, // Opcional: omitir duplicados basados en claves únicas
    });

    return NextResponse.json(
      {
        message: 'Importación masiva exitosa',
        count: result.count,
      },
      { status: 201, headers }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error al realizar la importación masiva de ítems' },
      { status: 500, headers }
    );
  }
}
