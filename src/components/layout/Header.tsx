"use client";

import React from "react";
import { Layout, Button, Typography } from "antd";
import { MenuOutlined } from "@ant-design/icons";

const { Header } = Layout;
const { Title } = Typography;

interface AppHeaderProps {
  toggleSidebar: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ toggleSidebar }) => {
  return (
    <Header
      style={{
        background: "#1890ff",
        padding: "0 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Button
        type="primary"
        icon={<MenuOutlined />}
        onClick={toggleSidebar}
        style={{ marginRight: "16px" }}
      />
      <Title level={3} style={{ color: "#fff", margin: 0 }}>
        Gestión escolar
      </Title>
      <Button type="primary">Agregar Pago</Button>
    </Header>
  );
};

export default AppHeader;
