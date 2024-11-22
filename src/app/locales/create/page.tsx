"use client";

import React from "react";
import { Typography } from "antd";
import LocalForm from "@/components/locales/LocalForm";

const { Title } = Typography;

const CreateLocalPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Crear Nuevo Local</Title>
      <LocalForm />
    </div>
  );
};

export default CreateLocalPage;
