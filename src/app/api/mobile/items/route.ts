import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Función para agregar encabezados CORS
function cors(request: Request) {
  const origin = request.headers.get('origin') || '*';

  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Max-Age', '86400'); // Cache para preflight

  return headers;
}

// Manejo del método OPTIONS para solicitudes preflight
export async function OPTIONS(request: Request) {
  const headers = cors(request);
  return new NextResponse(null, { status: 204, headers });
}

// Obtener todos los ítems sin filtros ni límites
export async function GET(request: Request) {
  try {
    const items = await prisma.item.findMany(); // Obtener todos los ítems

    return new NextResponse(
      JSON.stringify({ data: items }),
      { status: 200, headers: cors(request) }
    );
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: 'Error al obtener los ítems' }),
      { status: 500, headers: cors(request) }
    );
  }
}
