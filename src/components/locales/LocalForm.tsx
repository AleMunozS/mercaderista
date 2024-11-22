"use client";

import React, { useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { useRouter } from "next/navigation";
import axios from "axios";
import { LocalFormInputValues } from "@/types/types";

interface LocalFormProps {
  initialValues?: LocalFormInputValues;
  localId?: number;
}

const LocalForm: React.FC<LocalFormProps> = ({ initialValues, localId }) => {
  const [form] = Form.useForm<LocalFormInputValues>();
  const router = useRouter();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const onFinish = async (values: LocalFormInputValues) => {
    try {
      if (localId) {
        await axios.put(`/api/locales/${localId}`, values);
        message.success("Local actualizado exitosamente.");
      } else {
        await axios.post("/api/locales", values);
        message.success("Local creado exitosamente.");
      }
      router.push("/locales");
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const response = error.response?.data as { error?: string };
        if (response?.error) {
          message.error(response.error);
        } else {
          message.error("Error al guardar el local.");
        }
      } else {
        message.error("Error al guardar el local.");
      }
      console.error(error);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Nombre"
        name="nombre"
        rules={[{ required: true, message: "Por favor ingresa el nombre." }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Dirección"
        name="direccion"
        rules={[{ required: true, message: "Por favor ingresa la dirección." }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Supermercado"
        name="supermercado"
        rules={[
          { required: true, message: "Por favor ingresa el supermercado." },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {localId ? "Actualizar" : "Crear"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LocalForm;
