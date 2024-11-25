import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase-server';

// Configuración de CORS
const configureCORS = (headers: Headers) => {
  headers.set('Access-Control-Allow-Origin', '*'); // Cambia '*' por el dominio permitido en producción
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

// Manejo de solicitudes OPTIONS
export async function OPTIONS() {
  const headers = new Headers();
  configureCORS(headers);
  return new NextResponse(null, { status: 204, headers });
}

// Manejo de solicitudes POST
export async function POST(request: Request) {
  const headers = new Headers();
  configureCORS(headers);

  try {
    console.log('Petición recibida en /api/mobile/upload');

    const { fileName, base64Data } = await request.json();

    if (!fileName || !base64Data) {
      console.log('Datos incompletos:', { fileName, base64Data });
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400, headers });
    }

    console.log('Subiendo archivo:', { fileName });

    const fileBuffer = Buffer.from(base64Data, 'base64');

    const { data, error } = await supabase.storage
      .from('MerchApp')
      .upload(fileName, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('Error al subir archivo a Supabase:', error.message);
      return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500, headers });
    }

    console.log('Archivo subido exitosamente:', data);

    const { publicUrl } = supabase.storage.from('MerchApp').getPublicUrl(fileName).data;

    if (!publicUrl) {
      console.error('No se pudo obtener la URL pública');
      return NextResponse.json({ error: 'No se pudo obtener la URL pública' }, { status: 500, headers });
    }

    console.log('URL pública generada:', publicUrl);

    return NextResponse.json({ url: publicUrl }, { headers });
  } catch (error) {
    console.error('Error en el servidor:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500, headers });
  }
}
