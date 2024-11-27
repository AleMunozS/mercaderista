import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Rutas protegidas
const protectedRoutes = [
  "/asistencias",
  "/dashboard",
  "/eventos",
  "/items",
  "/usuarios",
  "/locales",
  "/vouchers",
];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Verifica si la ruta está protegida
  const isProtectedRoute = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  // Si la ruta es protegida y no hay token, redirige al login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/auth/login", req.url); // Ajusta la ruta de inicio de sesión si es necesario
    return NextResponse.redirect(loginUrl);
  }

  // Si está autenticado o la ruta no es protegida, continúa
  return NextResponse.next();
}

// Configuración de las rutas protegidas
export const config = {
  matcher: [
    "/asistencias/:path*",
    "/dashboard/:path*",
    "/eventos/:path*",
    "/items/:path*",
    "/usuarios/:path*",
    "/locales/:path*",
    "/vouchers/:path*",
  ],
};
