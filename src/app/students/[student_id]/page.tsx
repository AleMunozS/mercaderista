// app/students/[student_id]/page.tsx

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { message, Spin } from "antd";
import StudentForm from "@/components/students/StudentForm";
import axios from "axios";

interface Parent {
  parent_id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Student {
  student_id: number;
  name: string;
  grade: string;
  parent_id: number;
  parent: Parent;
}

const EditStudentPage: React.FC<{ params: { student_id: string } }> = ({ params }) => {
  const { student_id } = params;
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/students/${student_id}`);
      setStudent(response.data);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        message.error("Estudiante no encontrado.");
        router.push("/students");
      } else {
        message.error("Error al obtener los datos del estudiante.");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student_id]);

  if (loading || !student) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <StudentForm
        initialValues={{
          name: student.name,
          grade: student.grade,
          parent_id: student.parent_id,
        }}
        isEdit
        studentId={student.student_id}
      />
    </div>
  );
};

export default EditStudentPage;
