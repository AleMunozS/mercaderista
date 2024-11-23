// src/components/items/ItemForm.tsx

"use client";

import React, { useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { useRouter } from "next/navigation";
import axios from "axios";

interface ItemFormInputValues {
  nombre: string;
  itemCode: string;
}

interface ItemFormProps {
  initialValues?: ItemFormInputValues;
  itemId?: number;
}

const ItemForm: React.FC<ItemFormProps> = ({ initialValues, itemId }) => {
  const [form] = Form.useForm<ItemFormInputValues>();
  const router = useRouter();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const onFinish = async (values: ItemFormInputValues) => {
    try {
      if (itemId) {
        await axios.put(`/api/items/${itemId}`, values);
        message.success("Item actualizado exitosamente.");
      } else {
        await axios.post("/api/items", values);
        message.success("Item creado exitosamente.");
      }
      router.push("/items");
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const response = error.response?.data as { error?: string };
        if (response?.error) {
          message.error(response.error);
        } else {
          message.error("Error al guardar el item.");
        }
      } else {
        message.error("Error al guardar el item.");
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
        label="Código de Item"
        name="itemCode"
        rules={[{ required: true, message: "Por favor ingresa el código del item." }]}
      >
        <Input />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {itemId ? "Actualizar" : "Crear"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ItemForm;
