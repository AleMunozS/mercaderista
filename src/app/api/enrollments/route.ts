// app/api/enrollments/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";




export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;


    const enrollmentId = searchParams.get('enrollment_id') || undefined;
    const studentId = searchParams.get('student_id') || undefined;
    const grade = searchParams.get('grade') || undefined;
    const academicYear = searchParams.get('academic_year') || undefined;
    const dateFrom = searchParams.get('date_from') || undefined;
    const dateTo = searchParams.get('date_to') || undefined;


    const sortBy = searchParams.get('sort_by') || 'enrollment_id';
    const sortOrder = searchParams.get('sort_order') || 'asc';


    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    console.log(`Page: ${page}, Limit: ${limit}, Skip: ${skip}`);
    console.log(`Sort By: ${sortBy}, Sort Order: ${sortOrder}`);


    const where: any = {};

    if (enrollmentId) {
      const enrollmentIdInt = parseInt(enrollmentId, 10);
      if (!isNaN(enrollmentIdInt)) {
        where.enrollment_id = enrollmentIdInt;
      }
    }

    if (studentId) {
      const studentIdInt = parseInt(studentId, 10);
      if (!isNaN(studentIdInt)) {
        where.student_id = studentIdInt;
      }
    }

    if (grade) {
      where.grade = {
        contains: grade,
        mode: 'insensitive',
      };
    }

    if (academicYear) {
      where.academic_year = {
        contains: academicYear,
        mode: 'insensitive',
      };
    }

    if (dateFrom || dateTo) {
      where.enrollment_date = {};
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (!isNaN(fromDate.getTime())) {
          where.enrollment_date.gte = fromDate;
        }
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        if (!isNaN(toDate.getTime())) {
          where.enrollment_date.lte = toDate;
        }
      }
    }

    console.log('Filtros aplicados:', where);


    const sortableFields = ['enrollment_id', 'student_id', 'grade', 'academic_year', 'enrollment_date'];
    if (!sortableFields.includes(sortBy)) {
      console.error(`El campo de ordenamiento '${sortBy}' no es válido.`);
      return NextResponse.json(
        { error: `El campo de ordenamiento '${sortBy}' no es válido.` },
        { status: 400 }
      );
    }


    const order: any = {};
    if (sortOrder !== 'asc' && sortOrder !== 'desc') {
      console.error(`El orden '${sortOrder}' no es válido.`);
      return NextResponse.json(
        { error: `El orden '${sortOrder}' no es válido. Use 'asc' o 'desc'.` },
        { status: 400 }
      );
    }
    order[sortBy] = sortOrder;

    console.log(`Orden aplicado:`, order);


    const [enrollments, total] = await prisma.$transaction([
      prisma.enrollment.findMany({
        where,
        orderBy: order,
        skip,
        take: limit,
        include: {
          student: {
            include: {
              parent: true,
            },
          },
        },
      }),
      prisma.enrollment.count({
        where,
      }),
    ]);

    console.log(`Inscripciones encontradas: ${enrollments.length}`);
    console.log(`Total de inscripciones: ${total}`);

    return NextResponse.json(
      {
        data: enrollments,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al obtener las inscripciones:", error);
    return NextResponse.json(
      { error: "Error al obtener las inscripciones." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_id, grade, academic_year } = body;

    if (!student_id || !grade || !academic_year) {
      return NextResponse.json(
        { error: "student_id, grade y academic_year son requeridos." },
        { status: 400 }
      );
    }

    const studentExists = await prisma.student.findUnique({
      where: { student_id: student_id },
    });

    if (!studentExists) {
      return NextResponse.json(
        { error: "El estudiante asociado no existe." },
        { status: 400 }
      );
    }

    const newEnrollment = await prisma.enrollment.create({
      data: {
        student_id,
        grade,
        academic_year,
      },
      include: {
        student: {
          include: {
            parent: true,
          },
        },
      },
    });

    return NextResponse.json(newEnrollment, { status: 201 });
  } catch (error) {
    console.error("Error al crear la inscripción:", error);
    return NextResponse.json(
      { error: "Error al crear la inscripción." },
      { status: 500 }
    );
  }
}
