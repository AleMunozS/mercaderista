"use client";

import React from "react";
import { Typography, Button } from "antd";
import Link from "next/link";
import EventoList from "@/components/eventos/EventoList";

const { Title } = Typography;

const EventosPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Administrar Eventos</Title>
      <Link href="/eventos/create">
        <Button type="primary" style={{ marginBottom: "20px" }}>
          Agregar Nuevo Evento
        </Button>
      </Link>
      <EventoList />
    </div>
  );
};

export default EventosPage;
