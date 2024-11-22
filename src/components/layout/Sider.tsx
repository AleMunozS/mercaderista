"use client";

import React from "react";
import { Layout, Menu } from "antd";
import {
  UserOutlined,
  ShopOutlined,
  CalendarOutlined,
  FileTextOutlined,
  FileSearchOutlined,
  PictureOutlined,
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
      key: "/usuarios",
      icon: <UserOutlined />,
      label: <Link href="/usuarios">Usuarios</Link>,
    },
    {
      key: "/locales",
      icon: <ShopOutlined />,
      label: <Link href="/locales">Locales</Link>,
    },
    {
      key: "/asistencias",
      icon: <CalendarOutlined />,
      label: <Link href="/asistencias">Asistencias</Link>,
    },
    {
      key: "/vouchers",
      icon: <FileTextOutlined />,
      label: <Link href="/vouchers">Vouchers</Link>,
    },
    {
      key: "/eventos",
      icon: <FileSearchOutlined />,
      label: <Link href="/eventos">Eventos</Link>,
    },
  ];

  const selectedKey =
    menuItems.find((item) => pathname.startsWith(item.key))?.key || "/usuarios";

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
