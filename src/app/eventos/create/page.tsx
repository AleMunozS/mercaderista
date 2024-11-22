"use client";

import React from "react";
import { Typography } from "antd";
import EventoForm from "@/components/eventos/EventoForm";

const { Title } = Typography;

const CreateEventoPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Crear Nuevo Evento</Title>
      <EventoForm />
    </div>
  );
};

export default CreateEventoPage;
