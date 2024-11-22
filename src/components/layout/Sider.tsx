// src/components/layout/Sider.tsx

"use client";

import React from "react";
import { Layout, Menu } from "antd";
import {
  DollarOutlined,
  TeamOutlined,
  MailOutlined,
  FileTextOutlined,
  BookOutlined,
  UserOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

const { Sider } = Layout;

interface AppSiderProps {
  collapsed: boolean;
}

const AppSider: React.FC<AppSiderProps> = ({ collapsed }) => {
  const pathname = usePathname();

  const menuItems = [
    {
      key: "/fees",
      icon: <DollarOutlined />,
      label: <Link href="/fees">Gestión de Cuotas</Link>,
    },
    {
      key: "/payments",
      icon: <TeamOutlined />,
      label: <Link href="/payments">Pagos</Link>,
    },
    {
      key: "/contact",
      icon: <MailOutlined />,
      label: <Link href="/contact">Contacto con Padres</Link>,
    },
    {
      key: "/reports",
      icon: <FileTextOutlined />,
      label: <Link href="/reports">Informes</Link>,
    },
    {
      key: "/parents",
      icon: <TeamOutlined />,
      label: <Link href="/parents">Padres</Link>,
    },
    {
      key: "/enrollments",
      icon: <BookOutlined />,
      label: <Link href="/enrollments">Inscripciones</Link>,
    },
    {
      key: "/employees",
      icon: <UserOutlined />,
      label: <Link href="/employees">Empleados</Link>,
    },
    {
      key: "/students",
      icon: <ReadOutlined />,
      label: <Link href="/students">Estudiantes</Link>,
    },
  ];

  const selectedKey =
    menuItems.find((item) => pathname.startsWith(item.key))?.key || "/fees";

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      width={200}
      style={{
        background: "#fff",
        padding: "0",
        margin: "0",
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        style={{
          height: "100%",
          borderRight: 0,
          padding: "0",
          margin: "0",
        }}
        items={menuItems}
      />
    </Sider>
  );
};

export default AppSider;
