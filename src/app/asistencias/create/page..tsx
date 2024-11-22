"use client";

import React from "react";
import { Typography } from "antd";
import AsistenciaForm from "@/components/asistencias/AsistenciaForm";

const { Title } = Typography;

const CreateAsistenciaPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Crear Nueva Asistencia</Title>
      <AsistenciaForm />
    </div>
  );
};

export default CreateAsistenciaPage;
