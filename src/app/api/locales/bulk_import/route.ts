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
    const locales: Array<{ nombre: string; direccion?: string; supermercado?: string }> = await request.json();

    // Validar que el payload sea un arreglo
    if (!Array.isArray(locales)) {
      return NextResponse.json(
        { error: 'El payload debe ser un arreglo de locales' },
        { status: 400, headers }
      );
    }

    // Validar cada local usando un bucle for tradicional
    for (let index = 0; index < locales.length; index++) {
      const local = locales[index];
      if (!local.nombre) {
        return NextResponse.json(
          { error: `El local en la posición ${index + 1} está incompleto: falta 'nombre'` },
          { status: 400, headers }
        );
      }
      // 'direccion' y 'supermercado' son opcionales
    }

    // Insertar los locales de manera masiva
    const result = await prisma.local.createMany({
      data: locales,
      skipDuplicates: true, // Opcional: omitir duplicados basados en claves únicas
    });

    return NextResponse.json(
      {
        message: 'Importación masiva de locales exitosa',
        count: result.count,
      },
      { status: 201, headers }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error al realizar la importación masiva de locales' },
      { status: 500, headers }
    );
  }
}
