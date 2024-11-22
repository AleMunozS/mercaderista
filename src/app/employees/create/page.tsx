"use client";

import React from "react";
import { Typography, Button } from "antd";
import Link from "next/link";
import EmployeeForm from "@/components/employees/EmployeeForm";

const { Title } = Typography;

const CreateEmployeePage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Agregar Nuevo Empleado</Title>
      <EmployeeForm />
      <Link href="/employees">
        <Button style={{ marginTop: "20px" }}>Volver a la Lista</Button>
      </Link>
    </div>
  );
};

export default CreateEmployeePage;
