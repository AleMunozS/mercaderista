"use client";

import React, { useEffect, useState } from "react";
import { Typography, message } from "antd";
import { useRouter, useParams } from "next/navigation";
import AsistenciaForm from "@/components/asistencias/AsistenciaForm";
import axios from "axios";

const { Title } = Typography;

const EditAsistenciaPage: React.FC = () => {
  const { id } = useParams();
  const [initialValues, setInitialValues] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAsistencia = async () => {
      try {
        const response = await axios.get(`/api/asistencia/${id}`);
        setInitialValues(response.data);
      } catch (error) {
        message.error("Error al cargar la asistencia.");
        console.error(error);
        router.push("/asistencias");
      } finally {
        setLoading(false);
      }
    };
    fetchAsistencia();
  }, [id, router]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Editar Asistencia</Title>
      <AsistenciaForm initialValues={initialValues} asistenciaId={Number(id)} />
    </div>
  );
};

export default EditAsistenciaPage;
