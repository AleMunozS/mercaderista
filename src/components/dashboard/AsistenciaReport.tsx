// src/components/dashboard/AsistenciaReport.tsx

"use client";

import React, { useEffect, useState } from "react";
import { Table, message } from "antd";
import axios from "axios";
import { Asistencia } from "@/types/types";

const AsistenciaReport: React.FC = () => {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAsistencias = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/asistencias?limit=10"); // Asegúrate de que tu API soporte este parámetro
      setAsistencias(response.data);
    } catch (error) {
      message.error("Error al cargar las asistencias.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsistencias();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Usuario",
      dataIndex: ["usuario", "nombre"],
      key: "usuario",
    },
    {
      title: "Local",
      dataIndex: ["local", "nombre"],
      key: "local",
    },
    {
      title: "Check-In",
      dataIndex: "checkInTime",
      key: "checkInTime",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Check-Out",
      dataIndex: "checkOutTime",
      key: "checkOutTime",
      render: (date: string) => (date ? new Date(date).toLocaleString() : "N/A"),
    },
  ];

  return (
    <div>
      <h2>Últimas Asistencias</h2>
      <Table
        dataSource={asistencias}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
      />
    </div>
  );
};

export default AsistenciaReport;
