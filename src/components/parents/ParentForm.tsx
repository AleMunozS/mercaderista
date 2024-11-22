// components/parents/ParentForm.tsx

"use client";

import { Form, Input, Button, message } from "antd";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect } from "react";
import { Parent } from "@prisma/client";

interface ParentFormProps {
  initialValues?: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  parentId?: number;
}

const ParentForm: React.FC<ParentFormProps> = ({ initialValues, parentId }) => {
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const onFinish = async (values: Parent) => {
    try {
      if (parentId) {
        await axios.put(`/api/parents/${parentId}`, values);
        message.success("Padre actualizado exitosamente.");
      } else {
        await axios.post("/api/parents", values);
        message.success("Padre creado exitosamente.");
      }
      router.push("/parents");
    } catch (error) {
      message.error("Error al guardar el padre.");
      console.error(error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <Form.Item
        label="Nombre"
        name="name"
        rules={[{ required: true, message: "Por favor ingresa el nombre." }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Correo Electrónico"
        name="email"
        rules={[
          {
            required: true,
            message: "Por favor ingresa el correo electrónico.",
          },
          { type: "email", message: "Por favor ingresa un correo válido." },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Teléfono"
        name="phone"
        rules={[{ required: true, message: "Por favor ingresa el teléfono." }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Dirección"
        name="address"
        rules={[{ required: true, message: "Por favor ingresa la dirección." }]}
      >
        <Input />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {parentId ? "Actualizar" : "Crear"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ParentForm;
