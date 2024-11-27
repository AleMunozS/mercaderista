// app/api/locales/all/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Especifica el runtime
export const runtime = 'nodejs';

// Middleware de CORS
function cors(request: NextRequest) {
  const origin = request.headers.get('origin') || '*';
  console.log('CORS Middleware - Origin:', origin);

  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Max-Age', '86400'); // Opcional

  return headers;
}

export async function OPTIONS(request: NextRequest) {
  console.log('OPTIONS Request');
  const headers = cors(request);
  return new NextResponse(null, { status: 204, headers });
}

export async function GET(request: NextRequest) {
  console.log('GET Request received');
  const headers = cors(request);

  try {
    console.log('Fetching all locales from the database');
    const locales = await prisma.local.findMany();
    console.log('Locales fetched:', locales);

    return new NextResponse(JSON.stringify(locales), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error fetching locales:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Error al obtener locales' }),
      {
        status: 500,
        headers,
      }
    );
  }
}
