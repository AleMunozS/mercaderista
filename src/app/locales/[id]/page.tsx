"use client";

import React, { useEffect, useState } from "react";
import { Typography, message } from "antd";
import { useRouter, useParams } from "next/navigation";
import LocalForm from "@/components/locales/LocalForm";
import axios from "axios";

const { Title } = Typography;

const EditLocalPage: React.FC = () => {
  const { id } = useParams();
  const [initialValues, setInitialValues] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLocal = async () => {
      try {
        const response = await axios.get(`/api/locales/${id}`);
        setInitialValues(response.data);
      } catch (error) {
        message.error("Error al cargar el local.");
        console.error(error);
        router.push("/locales");
      } finally {
        setLoading(false);
      }
    };
    fetchLocal();
  }, [id, router]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Editar Local</Title>
      <LocalForm initialValues={initialValues} localId={Number(id)} />
    </div>
  );
};

export default EditLocalPage;
