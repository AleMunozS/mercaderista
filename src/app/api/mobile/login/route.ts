// app/api/mobile/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Asegúrate de que esta ruta sea correcta
import bcrypt from 'bcrypt';

const predefinedUser = {
  username: 'superadmin',
  password: 'superadmin',
  role: 'admin',
};

// Función para agregar encabezados CORS
function cors(request: NextRequest) {
  const origin = request.headers.get('origin') || '*';

  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Max-Age', '86400'); // Cache para preflight

  return headers;
}

// Manejo del método OPTIONS para solicitudes preflight
export async function OPTIONS(request: NextRequest) {
  const headers = cors(request);
  return new NextResponse(null, { status: 204, headers });
}

// Manejo del método POST para la autenticación
export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json(
      { success: false, message: 'Usuario y contraseña son requeridos' },
      { status: 400, headers: cors(request) }
    );
  }

  try {
    // Buscar al usuario en la base de datos
    const user = await prisma.usuario.findUnique({
      where: { email: username },
    });

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        return NextResponse.json(
          {
            success: true,
            data: {
              id: user.id,
              name: user.nombre,
              email: user.email,
              role: user.roles,
            },
          },
          { status: 200, headers: cors(request) }
        );
      }
    } else if (
      username === predefinedUser.username &&
      password === predefinedUser.password
    ) {
      return NextResponse.json(
        {
          success: true,
          data: {
            id: '1',
            name: predefinedUser.username,
            email: 'developer@example.com',
            role: predefinedUser.role,
          },
        },
        { status: 200, headers: cors(request) }
      );
    }

    // Si las credenciales no son válidas
    return NextResponse.json(
      { success: false, message: 'Credenciales inválidas' },
      { status: 401, headers: cors(request) }
    );
  } catch (error) {
    console.error('Error durante la autenticación:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500, headers: cors(request) }
    );
  }
}
