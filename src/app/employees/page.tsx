"use client";

import React from "react";
import { Typography, Button } from "antd";
import Link from "next/link";
import EmployeeList from "@/components/employees/EmployeeList";

const { Title } = Typography;

const EmployeesPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Administrar Empleados</Title>
      <Link href="/employees/create">
        <Button type="primary" style={{ marginBottom: "20px" }}>
          Agregar Nuevo Empleado
        </Button>
      </Link>
      <EmployeeList />
    </div>
  );
};

export default EmployeesPage;
