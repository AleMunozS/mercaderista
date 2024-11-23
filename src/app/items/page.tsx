"use client";

import React from "react";
import { Typography, Button } from "antd";
import Link from "next/link";
import ItemList from "@/components/items/ItemList";

const { Title } = Typography;

const ItemsPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Administrar Items</Title>
      <Link href="/items/create">
        <Button type="primary" style={{ marginBottom: "20px" }}>
          Agregar Nuevo Item
        </Button>
      </Link>
      <ItemList />
    </div>
  );
};

export default ItemsPage;
