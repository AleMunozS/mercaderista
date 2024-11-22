// components/students/StudentForm.tsx

"use client";

import { Form, Input, Button, Select, message } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const { Option } = Select;

interface Parent {
  parent_id: number;
  name: string;
}

interface StudentFormProps {
  initialValues?: {
    name: string;
    grade: string;
    parent_id: number;
  };
  isEdit?: boolean;
  studentId?: number;
}

const StudentForm: React.FC<StudentFormProps> = ({ initialValues, isEdit = false, studentId }) => {
  const [form] = Form.useForm();
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  // Obtener la lista de padres para el select
  const fetchParents = async () => {
    try {
      const response = await axios.get("/api/parents");
      setParents(response.data.data);
    } catch (error) {
      message.error("Error al obtener la lista de padres.");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (isEdit && studentId) {
        await axios.put(`/api/students/${studentId}`, values);
        message.success("Estudiante actualizado exitosamente.");
      } else {
        await axios.post("/api/students", values);
        message.success("Estudiante creado exitosamente.");
      }
      router.push("/students");
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        message.error(error.response.data.error);
      } else {
        message.error("Error al procesar la solicitud.");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues}
      style={{ maxWidth: "600px", margin: "0 auto" }}
    >
      <Form.Item
        label="Nombre"
        name="name"
        rules={[{ required: true, message: "Por favor, ingresa el nombre." }]}
      >
        <Input placeholder="Nombre del estudiante" />
      </Form.Item>

      <Form.Item
        label="Grado"
        name="grade"
        rules={[{ required: true, message: "Por favor, ingresa el grado." }]}
      >
        <Input placeholder="Grado del estudiante" />
      </Form.Item>

      <Form.Item
        label="Padre"
        name="parent_id"
        rules={[{ required: true, message: "Por favor, selecciona un padre." }]}
      >
        <Select placeholder="Selecciona un padre">
          {parents.map((parent) => (
            <Option key={parent.parent_id} value={parent.parent_id}>
              {parent.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {isEdit ? "Actualizar Estudiante" : "Crear Estudiante"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default StudentForm;
