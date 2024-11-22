"use client";

import React from "react";
import { Typography, Button } from "antd";
import Link from "next/link";
import LocalList from "@/components/locales/LocalList";


const { Title } = Typography;

const LocalesPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Administrar Locales</Title>
      <Link href="/locales/create">
        <Button type="primary" style={{ marginBottom: "20px" }}>
          Agregar Nuevo Local
        </Button>
      </Link>
      <LocalList />
    </div>
  );
};

export default LocalesPage;
