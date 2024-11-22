"use client";

import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Select } from "antd";
import { useRouter } from "next/navigation";
import axios from "axios";
import { EventoFormInputValues, Usuario } from "@/types/types";

const { Option } = Select;

interface EventoFormProps {
  initialValues?: EventoFormInputValues;
  eventoId?: number;
}

const EventoForm: React.FC<EventoFormProps> = ({ initialValues, eventoId }) => {
  const [form] = Form.useForm<EventoFormInputValues>();
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get("/api/usuarios");
        setUsuarios(response.data);
      } catch (error) {
        message.error("Error al cargar los usuarios.");
      }
    };

    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const onFinish = async (values: EventoFormInputValues) => {
    try {
      if (eventoId) {
        await axios.put(`/api/eventos/${eventoId}`, values);
        message.success("Evento actualizado exitosamente.");
      } else {
        await axios.post("/api/eventos", values);
        message.success("Evento creado exitosamente.");
      }
      router.push("/eventos");
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const response = error.response?.data as { error?: string };
        if (response?.error) {
          message.error(response.error);
        } else {
          message.error("Error al guardar el evento.");
        }
      } else {
        message.error("Error al guardar el evento.");
      }
      console.error(error);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Usuario"
        name="usuarioId"
        rules={[{ required: true, message: "Por favor selecciona un usuario." }]}
      >
        <Select placeholder="Selecciona un usuario">
          {usuarios.map((usuario) => (
            <Option key={usuario.id} value={usuario.id}>
              {usuario.nombre}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Mensaje"
        name="mensaje"
        rules={[{ required: true, message: "Por favor ingresa un mensaje." }]}
      >
        <Input.TextArea rows={4} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {eventoId ? "Actualizar" : "Crear"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EventoForm;
