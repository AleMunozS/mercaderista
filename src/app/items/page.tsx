"use client";

import React from "react";
import { Typography, Button } from "antd";
import Link from "next/link";
import ItemList from "@/components/items/ItemList";
import BulkImportButton from "@/components/items/BulkImportButton"; // Importar el nuevo componente

const { Title } = Typography;

const ItemsPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Administrar Items</Title>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <Link href="/items/create">
          <Button type="primary">Agregar Nuevo Item</Button>
        </Link>
        <BulkImportButton /> {/* Agregar el botón de importación masiva */}
      </div>
      <ItemList />
    </div>
  );
};

export default ItemsPage;
