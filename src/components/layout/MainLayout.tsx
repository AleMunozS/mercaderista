"use client";

import React, { useState } from "react";
import SessionProviderWrapper from "@/components/auth/SessionProviderWrapper";
import AppHeader from "@/components/layout/Header";
import AppSider from "@/components/layout/Sider";
import { ConfigProvider, Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { AntdRegistry } from "@ant-design/nextjs-registry";

export const metadata = {
  title: "Administración de mercancía",
  description: "Administración de mercancía",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <html lang="es">
      <head>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 0;
            min-height: 100vh;
            background-color: #FFFAF0;
          }
        `}</style>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body>
        <AntdRegistry>
          <SessionProviderWrapper>
          <ConfigProvider
  theme={{
    token: {
      colorPrimary: "#1DA57A",
      colorSuccess: "#52c41a",
      colorError: "#ff4d4f",
      colorWarning: "#faad14",
      colorInfo: "#1890ff",
      borderRadius: 8,
      fontSize: 16,
      // Añade más tokens según tus necesidades
    },
  }}
>
            <Layout style={{ minHeight: "100vh" }}>
              <AppHeader toggleSidebar={toggleSidebar} />
              <Layout>
                <AppSider collapsed={collapsed} />
                <Layout style={{ padding: "0", margin: "0" }}>
                  <Content style={{ margin: "0", background: "#fff" }}>
                    {children}
                  </Content>
                </Layout>
              </Layout>
            </Layout>
            </ConfigProvider>
          </SessionProviderWrapper>
        </AntdRegistry>
      </body>
    </html>
  );
}
