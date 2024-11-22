"use client";

import React, { useEffect, useState } from "react";
import { Table, message, Button, Space, Popconfirm } from "antd";
import axios from "axios";
import Link from "next/link";
import { Asistencia } from "@/types/types";

const AsistenciaList: React.FC = () => {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAsistencias = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/asistencia");
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

  const deleteAsistencia = async (id: number) => {
    try {
      await axios.delete(`/api/asistencia/${id}`);
      message.success("Asistencia eliminada exitosamente.");
      fetchAsistencias();
    } catch (error) {
      message.error("Error al eliminar la asistencia.");
      console.error(error);
    }
  };

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
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: Asistencia) => (
        <Space size="middle">
          <Link href={`/asistencias/${record.id}`}>
            <Button type="primary">Editar</Button>
          </Link>
          <Popconfirm
            title="¿Estás seguro de eliminar esta asistencia?"
            onConfirm={() => deleteAsistencia(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button danger>Eliminar</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={asistencias}
      columns={columns}
      rowKey="id"
      loading={loading}
    />
  );
};

export default AsistenciaList;
