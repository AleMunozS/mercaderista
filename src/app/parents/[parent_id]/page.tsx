// app/parents/[parent_id]/page.tsx

"use client";

import { useParams } from "next/navigation";
import { Typography, Spin, message, Button } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import Link from "next/link";
import ParentForm from "@/components/parents/ParentForm";

const { Title } = Typography;

interface Parent {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const EditParentPage: React.FC = () => {
  const { parent_id } = useParams();
  const [parent, setParent] = useState<Parent | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchParent = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/parents/${parent_id}`);
      setParent(response.data);
    } catch (error) {
      message.error("Error al obtener los datos del padre.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParent();
  }, [parent_id]);

  if (loading) {
    return <Spin />;
  }

  if (!parent) {
    return <div>No se encontró el padre.</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Editar Padre</Title>
      <ParentForm
        initialValues={parent}
        parentId={parseInt(parent_id as string, 10)}
      />
      <Link href="/parents">
        <Button style={{ marginTop: "20px" }}>Volver a la Lista</Button>
      </Link>
    </div>
  );
};

export default EditParentPage;
