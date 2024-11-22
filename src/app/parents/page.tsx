// app/parents/page.tsx

"use client";

import ParentList from "@/components/parents/ParentList";
import { Button, Typography } from "antd";
import Link from "next/link";

const { Title } = Typography;

const ParentsPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Administrar Padres</Title>
      <Link href="/parents/create">
        <Button type="primary" style={{ marginBottom: "20px" }}>
          Crear Nuevo Padre
        </Button>
      </Link>
      <ParentList />
    </div>
  );
};

export default ParentsPage;
