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

const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
        
      </Row>

      <div style={{ marginTop: "40px" }}>
        <AsistenciaReport />
      </div>
    </div>
  );
};

export default DashboardPage;
