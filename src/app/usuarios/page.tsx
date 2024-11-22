"use client";

import React from "react";
import { Typography, Button } from "antd";
import Link from "next/link";
import UsuarioList from "@/components/usuarios/UsuarioList";

const { Title } = Typography;

const UsuariosPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Administrar Usuarios</Title>
      <Link href="/usuarios/create">
        <Button type="primary" style={{ marginBottom: "20px" }}>
          Agregar Nuevo Usuario
        </Button>
      </Link>
      <UsuarioList />
    </div>
  );
};

export default UsuariosPage;
