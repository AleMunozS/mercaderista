// app/parents/create/page.tsx

"use client";

import { Typography } from "antd";
import Link from "next/link";
import { Button } from "antd";
import ParentForm from "@/components/parents/ParentForm";

const { Title } = Typography;

const CreateParentPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Crear Nuevo Padre</Title>
      <ParentForm />
      <Link href="/parents">
        <Button style={{ marginTop: "20px" }}>Volver a la Lista</Button>
      </Link>
    </div>
  );
};

export default CreateParentPage;
