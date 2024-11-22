"use client";

import React, { useEffect } from "react";
import { Form, Input, Select, Button, message } from "antd";
import { useRouter } from "next/navigation";
import axios from "axios";

const { Option } = Select;

interface UsuarioFormInputValues {
  nombre: string;
  email: string;
  password?: string;
  roles: string;
}

interface UsuarioFormProps {
  initialValues?: UsuarioFormInputValues;
  usuarioId?: number;
}

const UsuarioForm: React.FC<UsuarioFormProps> = ({
  initialValues,
  usuarioId,
}) => {
  const [form] = Form.useForm<UsuarioFormInputValues>();
  const router = useRouter();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const onFinish = async (values: UsuarioFormInputValues) => {
    try {
      if (usuarioId) {
        await axios.put(`/api/usuarios/${usuarioId}`, values);
        message.success("Usuario actualizado exitosamente.");
      } else {
        await axios.post("/api/usuarios", values);
        message.success("Usuario creado exitosamente.");
      }
      router.push("/usuarios");
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const response = error.response?.data as { error?: string };
        if (response?.error) {
          message.error(response.error);
        } else {
          message.error("Error al guardar el usuario.");
        }
      } else {
        message.error("Error al guardar el usuario.");
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
        label="Correo Electrónico"
        name="email"
        rules={[
          {
            required: true,
            message: "Por favor ingresa el correo electrónico.",
          },
          { type: "email", message: "Correo electrónico inválido." },
        ]}
      >
        <Input />
      </Form.Item>

      {!usuarioId && (
        <Form.Item
          label="Contraseña"
          name="password"
          rules={[
            { required: true, message: "Por favor ingresa la contraseña." },
            { min: 6, message: "La contraseña debe tener al menos 6 caracteres." },
          ]}
        >
          <Input.Password />
        </Form.Item>
      )}

      <Form.Item
        label="Roles"
        name="roles"
        rules={[{ required: true, message: "Por favor selecciona un rol." }]}
      >
        <Select placeholder="Selecciona un rol">
          <Option value="admin">Administrador</Option>
          <Option value="usuario">Usuario</Option>
          {/* Agrega más roles según sea necesario */}
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {usuarioId ? "Actualizar" : "Crear"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default UsuarioForm;
