// app/api/employees/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";
import type { EmployeeExtended, EmployeeFormValues } from "@/types/types";

export async function GET() {
  try {
    const employees: EmployeeExtended[] = await prisma.employee.findMany({
      include: {},
    });
    return NextResponse.json(employees, { status: 200 });
  } catch (error) {
    console.error("Error al obtener los empleados:", error);
    return NextResponse.json(
      { error: "Error al obtener los empleados." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: EmployeeFormValues = await request.json();
    const { name, email, phone, position, salary, start_date } = body;

    if (
      !name ||
      !email ||
      !phone ||
      !position ||
      salary === undefined ||
      !start_date
    ) {
      return NextResponse.json(
        {
          error:
            "name, email, phone, position, salary y start_date son requeridos.",
        },
        { status: 400 }
      );
    }

    const emailExists = await prisma.employee.findUnique({
      where: { email: email },
    });

    if (emailExists) {
      return NextResponse.json(
        { error: "Ya existe un empleado con este correo electrónico." },
        { status: 400 }
      );
    }

    const newEmployee: EmployeeExtended = await prisma.employee.create({
      data: {
        name,
        email,
        phone,
        position,
        salary: Number(salary),
        start_date: new Date(start_date),
      },
      include: {},
    });

    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear el empleado:", error);
    return NextResponse.json(
      { error: "Error al crear el empleado." },
      { status: 500 }
    );
  }
}
