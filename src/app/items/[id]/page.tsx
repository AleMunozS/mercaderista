"use client";

import React, { useEffect, useState } from "react";
import { Typography, message } from "antd";
import { useRouter, useParams } from "next/navigation";
import ItemForm from "@/components/items/ItemForm";
import axios from "axios";

const { Title } = Typography;

const EditItemPage: React.FC = () => {
  const { id } = useParams();
  const [initialValues, setInitialValues] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`/api/items/${id}`);
        setInitialValues(response.data);
      } catch (error) {
        message.error("Error al cargar el item.");
        console.error(error);
        router.push("/items");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, router]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Editar Item</Title>
      <ItemForm initialValues={initialValues} itemId={Number(id)} />
    </div>
  );
};

export default EditItemPage;
