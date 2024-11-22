// app/api/employees/[employee_id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";
import type { EmployeeFormValues } from "@/types/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { employee_id: string } }
) {
  const { employee_id } = params;

  const id = parseInt(employee_id, 10);
  if (isNaN(id)) {
    return NextResponse.json(
      { error: "ID de empleado inválido." },
      { status: 400 }
    );
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { employee_id: id },
      include: {},
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Empleado no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(employee, { status: 200 });
  } catch (error) {
    console.error("Error al obtener el empleado:", error);
    return NextResponse.json(
      { error: "Error al obtener el empleado." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { employee_id: string } }
) {
  const { employee_id } = params;
  const id = parseInt(employee_id, 10);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: "ID de empleado inválido." },
      { status: 400 }
    );
  }

  try {
    const body: EmployeeFormValues = await request.json();
    const { name, email, phone, position } = body;

    if (!name || !email || !phone || !position) {
      return NextResponse.json(
        { error: "name, email, phone y position son requeridos." },
        { status: 400 }
      );
    }

    const employeeExists = await prisma.employee.findUnique({
      where: { employee_id: id },
    });

    if (!employeeExists) {
      return NextResponse.json(
        { error: "Empleado no encontrado." },
        { status: 404 }
      );
    }

    const emailConflict = await prisma.employee.findFirst({
      where: {
        email: email,
        NOT: { employee_id: id },
      },
    });

    if (emailConflict) {
      return NextResponse.json(
        { error: "Otro empleado ya tiene este correo electrónico." },
        { status: 400 }
      );
    }

    const updatedEmployee = await prisma.employee.update({
      where: { employee_id: id },
      data: {
        name,
        email,
        phone,
        position,
      },
      include: {},
    });

    return NextResponse.json(updatedEmployee, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar el empleado:", error);
    return NextResponse.json(
      { error: "Error al actualizar el empleado." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { employee_id: string } }
) {
  const { employee_id } = params;
  const id = parseInt(employee_id, 10);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: "ID de empleado inválido." },
      { status: 400 }
    );
  }

  try {
    await prisma.employee.delete({
      where: { employee_id: id },
    });

    return NextResponse.json(
      { message: "Empleado eliminado exitosamente." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar el empleado:", error);
    if (error instanceof Error && (error as any).code === "P2025") {
      return NextResponse.json(
        { error: "Empleado no encontrado." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Error al eliminar el empleado." },
      { status: 500 }
    );
  }
}
