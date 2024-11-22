// app/dashboard/page.tsx

"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Layout, Button, Typography } from "antd";
import { useEffect } from "react";

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          backgroundColor: "#1DA57A",
        }}
      >
        <Title level={3} style={{ color: "white", margin: 0 }}>
          Dashboard
        </Title>
        <Button
          type="primary"
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          style={{
            backgroundColor: "#FF4500",
            borderRadius: 12,
          }}
        >
          Logout
        </Button>
      </Header>

      <Content style={{ padding: "20px", backgroundColor: "#FFFAF0" }}>
        <Title level={2}>Welcome, {session?.user?.name}</Title>
        <Paragraph>
          This is a protected dashboard page for authorized users only.
        </Paragraph>
      </Content>

      <Footer style={{ textAlign: "center", backgroundColor: "#FDF5E6" }}>
        School Management System ©2024
      </Footer>
    </Layout>
  );
}
