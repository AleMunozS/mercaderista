"use client";

import React from "react";
import { Typography } from "antd";
import ItemForm from "@/components/items/ItemForm";

const { Title } = Typography;

const CreateItemPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Crear Nuevo Item</Title>
      <ItemForm />
    </div>
  );
};

export default CreateItemPage;
