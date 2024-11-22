"use client";

import React from "react";
import { Typography, Button } from "antd";
import Link from "next/link";
import AsistenciaList from "@/components/asistencias/AsistenciaList";


const { Title } = Typography;

const AsistenciasPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Administrar Asistencias</Title>
      <Link href="/asistencias/create">
        <Button type="primary" style={{ marginBottom: "20px" }}>
          Agregar Nueva Asistencia
        </Button>
      </Link>
      <AsistenciaList />
    </div>
  );
};

export default AsistenciasPage;
