"use client";

import React from "react";
import { Typography } from "antd";
import UsuarioForm from "@/components/usuarios/UsuarioForm";

const { Title } = Typography;

const CreateUsuarioPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Crear Nuevo Usuario</Title>
      <UsuarioForm />
    </div>
  );
};

export default CreateUsuarioPage;
