// src \app\api\students\route.ts


import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const name = searchParams.get("name");
    const grade = searchParams.get("grade");
    const parent_name = searchParams.get("parent_name");
    const parent_email = searchParams.get("parent_email");

    const sortField = searchParams.get("sortField");
    const sortOrder = searchParams.get("sortOrder");

    const sortableFields = ["student_id", "name", "grade", "parent_name", "parent_email"];

    let orderBy: Prisma.StudentOrderByWithRelationInput | undefined;

    if (sortField && sortOrder && sortableFields.includes(sortField)) {
      if (sortField === "parent_name") {
        orderBy = { parent: { name: sortOrder as Prisma.SortOrder } };
      } else if (sortField === "parent_email") {
        orderBy = { parent: { email: sortOrder as Prisma.SortOrder } };
      } else {
        orderBy = { [sortField]: sortOrder as Prisma.SortOrder };
      }
    }

    const where: Prisma.StudentWhereInput = {};

    if (name) {
      where.name = { contains: name, mode: "insensitive" };
    }

    if (grade) {
      where.grade = { contains: grade, mode: "insensitive" };
    }

    if (parent_name || parent_email) {
      where.parent = {};
      if (parent_name) {
        where.parent.name = { contains: parent_name, mode: "insensitive" };
      }
      if (parent_email) {
        where.parent.email = { contains: parent_email, mode: "insensitive" };
      }
    }

    const students = await prisma.student.findMany({
      where,
      orderBy: orderBy ? [orderBy] : undefined,
      include: {
        parent: true,
      },
    });


    return NextResponse.json(
      {
        data: students,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al obtener los estudiantes:", error);
    return NextResponse.json(
      { error: "Error al obtener los estudiantes." },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, grade, parent_id } = body;

    if (!name || !grade || !parent_id) {
      return NextResponse.json(
        { error: "Nombre, grado y parent_id son requeridos." },
        { status: 400 }
      );
    }

    const parentExists = await prisma.parent.findUnique({
      where: { parent_id: parent_id },
    });

    if (!parentExists) {
      return NextResponse.json(
        { error: "El padre asociado no existe." },
        { status: 400 }
      );
    }

    const newStudent = await prisma.student.create({
      data: {
        name,
        grade,
        parent_id,
      },
      include: {
        parent: true,
      },
    });

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error("Error al crear el estudiante:", error);
    return NextResponse.json(
      { error: "Error al crear el estudiante." },
      { status: 500 }
    );
  }
}
