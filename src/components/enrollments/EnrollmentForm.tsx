// src/components/enrollments/EnrollmentForm.tsx

"use client";

import React, { useEffect, useState } from "react";
import { Form, Input, Select, Button, message } from "antd";
import { useRouter } from "next/navigation";
import axios from "axios";
import { EnrollmentFormValues } from "../../types/types";
import type { Student } from "@prisma/client";

const { Option } = Select;

interface EnrollmentFormProps {
  initialValues?: EnrollmentFormValues;
  enrollmentId?: number;
}

const EnrollmentForm: React.FC<EnrollmentFormProps> = ({
  initialValues,
  enrollmentId,
}) => {
  const [form] = Form.useForm<EnrollmentFormValues>();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get("/api/students");
        setStudents(response.data.data);
      } catch (error) {
        message.error("Error al cargar los estudiantes.");
        console.error(error);
      }
    };
    fetchStudents();

    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const onFinish = async (values: EnrollmentFormValues) => {
    try {
      if (enrollmentId) {
        await axios.put(`/api/enrollments/${enrollmentId}`, values);
        message.success("Inscripción actualizada exitosamente.");
      } else {
        await axios.post("/api/enrollments", values);
        message.success("Inscripción creada exitosamente.");
      }
      router.push("/enrollments");
    } catch (error) {
      message.error("Error al guardar la inscripción.");
      console.error(error);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Estudiante"
        name="student_id"
        rules={[
          { required: true, message: "Por favor selecciona el estudiante." },
        ]}
      >
        <Select placeholder="Selecciona un estudiante">
          {students.map((student) => (
            <Option key={student.student_id} value={student.student_id}>
              {student.name} ({student.grade})
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Grado"
        name="grade"
        rules={[{ required: true, message: "Por favor ingresa el grado." }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Año Académico"
        name="academic_year"
        rules={[
          { required: true, message: "Por favor ingresa el año académico." },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {enrollmentId ? "Actualizar" : "Crear"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EnrollmentForm;
