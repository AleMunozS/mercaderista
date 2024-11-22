// app/fees/create/page.tsx

"use client";

import { Typography, Button } from "antd";
import FeeForm from "@/components/fees/FeeForm";
import Link from "next/link";

const { Title } = Typography;

const CreateFeePage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Crear Nueva Cuota</Title>
      <FeeForm />
      <Link href="/fees">
        <Button style={{ marginTop: "20px" }}>Volver a la Lista</Button>
      </Link>
    </div>
  );
};

export default CreateFeePage;
