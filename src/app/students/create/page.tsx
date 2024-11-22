// app/students/create/page.tsx

"use client";

import { Typography, Button } from "antd";
import StudentForm from "@/components/students/StudentForm";
import { useRouter } from "next/navigation";

const { Title } = Typography;

const CreateStudentPage: React.FC = () => {
  const router = useRouter();

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <Title level={2}>Agregar Nuevo Estudiante</Title>
        <Button onClick={() => router.back()}>Regresar</Button>
      </div>
      <StudentForm />
    </div>
  );
};

export default CreateStudentPage;
