"use client";

import React, { useEffect, useState } from "react";
import { Row, Col, message } from "antd";
import {
  UserOutlined,
  ShopOutlined,
  FileTextOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";

import { SummaryData } from "@/types/types";
import axios from "axios";
import AsistenciaReport from "@/components/dashboard/AsistenciaReport";
import SummaryCard from "@/components/dashboard/SummaryCard";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { data: session, status } = useSession(); 


  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/auth/login'); // Redirige al login si no hay sesión
    }
  }, [status, router]);

  
  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/dashboard/summary");
      setSummary(response.data);
    } catch (error) {
      message.error("Error al cargar el resumen.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <SummaryCard
            title="Total de Usuarios"
            value={summary?.totalUsuarios || 0}
            icon={<UserOutlined />}
            color="#1890ff" // Azul
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <SummaryCard
            title="Total de Locales"
            value={summary?.totalLocales || 0}
            icon={<ShopOutlined />}
            color="#52c41a" // Verde
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <SummaryCard
            title="Total de Vouchers"
            value={summary?.totalVouchers || 0}
            icon={<FileTextOutlined />}
            color="#faad14" // Naranja
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <SummaryCard
            title="Total de Eventos"
            value={summary?.totalEventos || 0}
            icon={<FileSearchOutlined />}
            color="#ff4d4f" // Rojo
          />
        </Col>
      </Row>

      <div style={{ marginTop: "40px" }}>
        <AsistenciaReport />
      </div>
    </div>
  );
};

export default DashboardPage;
