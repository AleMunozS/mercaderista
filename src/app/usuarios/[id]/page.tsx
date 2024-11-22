"use client";

import React, { useEffect, useState } from "react";
import { Typography, message } from "antd";
import { useRouter, useParams } from "next/navigation";
import UsuarioForm from "@/components/usuarios/UsuarioForm";
import axios from "axios";

const { Title } = Typography;

const EditUsuarioPage: React.FC = () => {
  const { id } = useParams();
  const [initialValues, setInitialValues] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await axios.get(`/api/usuarios/${id}`);
        setInitialValues(response.data);
      } catch (error) {
        message.error("Error al cargar el usuario.");
        console.error(error);
        router.push("/usuarios");
      } finally {
        setLoading(false);
      }
    };
    fetchUsuario();
  }, [id, router]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Editar Usuario</Title>
      <UsuarioForm initialValues={initialValues} usuarioId={Number(id)} />
    </div>
  );
};

export default EditUsuarioPage;
