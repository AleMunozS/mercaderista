// app/fees/page.tsx

"use client";

import { Button, Typography } from "antd";
import Link from "next/link";
import FeeList from "@/components/fees/FeeList";

const { Title } = Typography;

const FeesPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Administrar Cuotas</Title>
      <Link href="/fees/create">
        <Button type="primary" style={{ marginBottom: "20px" }}>
          Crear Nueva Cuota
        </Button>
      </Link>
      <FeeList />
    </div>
  );
};

export default FeesPage;
