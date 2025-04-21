"use client";

import React from "react";
import { Layout, Button, Typography } from "antd";
import { LogoutOutlined, MenuOutlined } from "@ant-design/icons";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

const { Header } = Layout;
const { Title } = Typography;

interface AppHeaderProps {
  toggleSidebar: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ toggleSidebar }) => {
  const { data: session, status } = useSession();

  // Mostrar nada si no hay sesión
  if (!session && status !== "loading") {
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/auth/login" }); // Redirigir después de cerrar sesión
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <Header
      style={{
        background: "#1DA57A",
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
        Minera Poderosa
      </Title>
      <Button
        type="primary"
        danger
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        style={{  }}
      >
        Cerrar Sesión
      </Button>
    </Header>
  );
};

export default AppHeader;
