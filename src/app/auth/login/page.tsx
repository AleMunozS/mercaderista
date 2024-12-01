"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button, Form, Input, Typography, message } from "antd";

const { Title } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    const { username, password } = values;

    const result = await signIn("credentials", {
      redirect: true, // Redirección automática
      callbackUrl: "/", // URL de redirección
      username,
      password,
    });

    setLoading(false);

    if (result?.error) {
      setError("Credenciales incorrectas, por favor inténtalo de nuevo.");
      message.error("Error de autenticación");
    } else {
      message.success("Inicio de sesión exitoso");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#FFFAF0",
      }}
    >
      <div
        style={{
          padding: "2rem",
          backgroundColor: "#FDF5E6",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Title level={3} style={{ textAlign: "center", color: "#FF4500" }}>
          Iniciar Sesión
        </Title>

        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: "300px", margin: "0 auto" }}
        >
          <Form.Item
            label="Nombre de usuario"
            name="username"
            rules={[
              {
                required: true,
                message: "Por favor ingresa tu nombre de usuario",
              },
            ]}
          >
            <Input placeholder="Ingresa tu usuario" />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[
              { required: true, message: "Por favor ingresa tu contraseña" },
            ]}
          >
            <Input.Password placeholder="Ingresa tu contraseña" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ backgroundColor: "#1DA57A", borderRadius: "12px" }}
            >
              Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
