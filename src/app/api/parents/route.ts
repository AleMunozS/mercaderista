// app/api/parents/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';


export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const sortField = url.searchParams.get('sortField');
  const sortOrder = url.searchParams.get('sortOrder');


  const name = url.searchParams.get('name');
  const email = url.searchParams.get('email');
  const phone = url.searchParams.get('phone');
  const address = url.searchParams.get('address');


  const where: any = {};
  if (name) {
    where.name = { contains: name, mode: 'insensitive' };
  }
  if (email) {
    where.email = { contains: email, mode: 'insensitive' };
  }
  if (phone) {
    where.phone = { contains: phone };
  }
  if (address) {
    where.address = { contains: address, mode: 'insensitive' };
  }


  const orderBy: any = {};
  if (sortField && sortOrder) {
    orderBy[sortField] = sortOrder;
  }

  try {
    const parents = await prisma.parent.findMany({
      where,
      orderBy: sortField ? orderBy : undefined,
    });
    return NextResponse.json({ data: parents }, { status: 200 });

  } catch (error) {
    console.error('Error al obtener los padres:', error);
    return NextResponse.json({ error: 'Error al obtener los padres.' }, { status: 500 });
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, address } = body;


    if (!name || !email || !address) {
      return NextResponse.json({ error: 'Nombre, correo electrónico y dirección son requeridos.' }, { status: 400 });
    }

    const newParent = await prisma.parent.create({
      data: {
        name,
        email,
        phone,
        address,
      },
    });

    return NextResponse.json(newParent, { status: 201 });
  } catch (error) {
    console.error('Error al crear el padre:', error);
    return NextResponse.json({ error: 'Error al crear el padre.' }, { status: 500 });
  }
}
