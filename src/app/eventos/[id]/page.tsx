"use client";

import React, { useEffect, useState } from "react";
import { Typography, message } from "antd";
import { useRouter, useParams } from "next/navigation";
import EventoForm from "@/components/eventos/EventoForm";
import axios from "axios";

const { Title } = Typography;

const EditEventoPage: React.FC = () => {
  const { id } = useParams();
  const [initialValues, setInitialValues] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEvento = async () => {
      try {
        const response = await axios.get(`/api/eventos/${id}`);
        setInitialValues(response.data);
      } catch (error) {
        message.error("Error al cargar el evento.");
        console.error(error);
        router.push("/eventos");
      } finally {
        setLoading(false);
      }
    };
    fetchEvento();
  }, [id, router]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Editar Evento</Title>
      <EventoForm initialValues={initialValues} eventoId={Number(id)} />
    </div>
  );
};

export default EditEventoPage;
