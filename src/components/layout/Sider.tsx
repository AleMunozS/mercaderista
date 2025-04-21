// src/components/layout/Sider.tsx

"use client";

import React from "react";
import { Layout, Menu } from "antd";
import {
  UserOutlined,
  ShopOutlined,
  DashboardOutlined,
  FileTextOutlined,
  UploadOutlined,
  CopyOutlined,
  RetweetOutlined,
  UndoOutlined,
  TeamOutlined,
  BankOutlined,
  DatabaseOutlined,
  FileSearchOutlined,
  CalendarOutlined,
  LinkOutlined,
  ApiOutlined,
  BarChartOutlined,
  SettingOutlined,
  MailOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const { Sider } = Layout;

interface AppSiderProps {
  collapsed: boolean;
}

const AppSider: React.FC<AppSiderProps> = ({ collapsed }) => {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // No mostramos nada si no hay sesión
  if (!session && status !== "loading") {
    return null;
  }

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">Dashboard</Link>,
    },
    {
      key: "/orders",
      icon: <ShopOutlined />,
      label: <Link href="/orders">Orders</Link>,
      children: [
        {
          key: "/orders/manual",
          icon: <FileTextOutlined />,
          label: <Link href="/orders/manual">Manual Order Capture (SO, PO, Transfer, RMA)</Link>,
        },
        {
          key: "/orders/bulk",
          icon: <UploadOutlined />,
          label: <Link href="/orders/bulk">Bulk Upload (CSV / Excel templates)</Link>,
        },
        {
          key: "/orders/templates",
          icon: <CopyOutlined />,
          label: <Link href="/orders/templates">Order Templates & Cloning</Link>,
        },
      ],
    },
    {
      key: "/returns",
      icon: <RetweetOutlined />,
      label: <Link href="/returns">Returns & Cancellations</Link>,
      children: [
        {
          key: "/returns/rma",
          icon: <FileTextOutlined />,
          label: <Link href="/returns/rma">RMA / Return Order Processing</Link>,
        },
        {
          key: "/returns/cancellation",
          icon: <UndoOutlined />,
          label: <Link href="/returns/cancellation">Cancellation Workflows & Credit Memo Integration</Link>,
        },
      ],
    },
    {
      key: "/party",
      icon: <TeamOutlined />,
      label: <Link href="/party">Party & Address Management</Link>,
      children: [
        {
          key: "/party/roles",
          icon: <UserOutlined />,
          label: <Link href="/party/roles">Party Roles</Link>,
        },
        {
          key: "/party/address-snapshots",
          icon: <BankOutlined />,
          label: <Link href="/party/address-snapshots">Address Snapshots & Geocoding</Link>,
        },
      ],
    },
    {
      key: "/reference-data",
      icon: <DatabaseOutlined />,
      label: <Link href="/reference-data">Reference Data</Link>,
      children: [
        {
          key: "/reference-data/order-types",
          icon: <FileSearchOutlined />,
          label: <Link href="/reference-data/order-types">Order Types & Status Codes</Link>,
        },
        {
          key: "/reference-data/incoterms",
          icon: <FileSearchOutlined />,
          label: <Link href="/reference-data/incoterms">Incoterms & Payment Terms</Link>,
        },
        {
          key: "/reference-data/priority",
          icon: <CalendarOutlined />,
          label: <Link href="/reference-data/priority">Priority, Channels & Service Levels</Link>,
        },
      ],
    },
    {
      key: "/integrations",
      icon: <LinkOutlined />,
      label: <Link href="/integrations">DOM Integrations</Link>,
      children: [
        {
          key: "/integrations/erp-connectors",
          icon: <LinkOutlined />,
          label: <Link href="/integrations/erp-connectors">ERP Connectors (REST / EDI / Webhooks)</Link>,
        },
        {
          key: "/integrations/outbox",
          icon: <FileSearchOutlined />,
          label: <Link href="/integrations/outbox">Outbox Monitor & Retry Logs</Link>,
        },
        {
          key: "/integrations/api-explorer",
          icon: <ApiOutlined />,
          label: <Link href="/integrations/api-explorer">API Explorer</Link>,
        },
      ],
    },
    {
      key: "/reports",
      icon: <BarChartOutlined />,
      label: <Link href="/reports">Reports & Analytics</Link>,
      children: [
        {
          key: "/reports/performance",
          icon: <BarChartOutlined />,
          label: <Link href="/reports/performance">Order Performance (fill rate, lead times)</Link>,
        },
        {
          key: "/reports/allocation-accuracy",
          icon: <BarChartOutlined />,
          label: <Link href="/reports/allocation-accuracy">Allocation Accuracy</Link>,
        },
        {
          key: "/reports/exception-trends",
          icon: <BarChartOutlined />,
          label: <Link href="/reports/exception-trends">Exception Trends</Link>,
        },
      ],
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: <Link href="/settings">Settings & Configuration</Link>,
      children: [
        {
          key: "/settings/allocation-rules",
          icon: <SettingOutlined />,
          label: <Link href="/settings/allocation-rules">Allocation Rule Definitions</Link>,
        },
        {
          key: "/settings/release-profiles",
          icon: <CalendarOutlined />,
          label: <Link href="/settings/release-profiles">Release Profiles & Schedules</Link>,
        },
        {
          key: "/settings/notification-templates",
          icon: <MailOutlined />,
          label: <Link href="/settings/notification-templates">Notification Templates</Link>,
        },
      ],
    },
  ];

  const selectedKey =
    menuItems
      .flatMap(item => [item.key, ...(item.children?.map(child => child.key) ?? [])])
      .find(key => pathname.startsWith(key)) || "/dashboard";

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      width={200}
      style={{ padding: "0", margin: "0" }}
    >
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        style={{ height: "100%", borderRight: 0, padding: "0", margin: "0" }}
        items={menuItems}
      />
    </Sider>
  );
};

export default AppSider;
