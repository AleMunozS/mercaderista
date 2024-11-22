"use client";

import React, { useEffect, useState } from "react";
import { Table, message, Button, Space, Popconfirm } from "antd";
import axios from "axios";
import Link from "next/link";
import { Local } from "@/types/types";

const LocalList: React.FC = () => {
  const [locales, setLocales] = useState<Local[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLocales = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/locales");
      setLocales(response.data);
    } catch (error) {
      message.error("Error al cargar los locales.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocales();
  }, []);

  const deleteLocal = async (id: number) => {
    try {
      await axios.delete(`/api/locales/${id}`);
      message.success("Local eliminado exitosamente.");
      fetchLocales();
    } catch (error) {
      message.error("Error al eliminar el local.");
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
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
    },
    {
      title: "Dirección",
      dataIndex: "direccion",
      key: "direccion",
    },
    {
      title: "Supermercado",
      dataIndex: "supermercado",
      key: "supermercado",
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: Local) => (
        <Space size="middle">
          <Link href={`/locales/${record.id}`}>
            <Button type="primary">Editar</Button>
          </Link>
          <Popconfirm
            title="¿Estás seguro de eliminar este local?"
            onConfirm={() => deleteLocal(record.id)}
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
      dataSource={locales}
      columns={columns}
      rowKey="id"
      loading={loading}
    />
  );
};

export default LocalList;
