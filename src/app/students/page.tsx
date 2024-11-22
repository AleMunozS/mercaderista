// app/students/page.tsx

"use client";

import { Button, Typography } from "antd";
import Link from "next/link";
import StudentList from "@/components/students/StudentList";

const { Title } = Typography;

const StudentsPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Lista de Estudiantes</Title>
      <Link href="/students/create">
        <Button type="primary" style={{ marginBottom: "20px" }}>
          Agregar Nuevo Estudiante
        </Button>
      </Link>
      <StudentList />
    </div>
  );
};

export default StudentsPage;
