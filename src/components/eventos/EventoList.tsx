"use client";

import React, { useEffect, useState } from "react";
import { Table, message, Button, Space, Popconfirm } from "antd";
import axios from "axios";
import Link from "next/link";
import { Evento } from "@/types/types";

const EventoList: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchEventos = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/eventos");
      setEventos(response.data);
    } catch (error) {
      message.error("Error al cargar los eventos.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const deleteEvento = async (id: number) => {
    try {
      await axios.delete(`/api/eventos/${id}`);
      message.success("Evento eliminado exitosamente.");
      fetchEventos();
    } catch (error) {
      message.error("Error al eliminar el evento.");
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
      title: "Mensaje",
      dataIndex: "mensaje",
      key: "mensaje",
    },
    {
      title: "Fecha",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: Evento) => (
        <Space size="middle">
          <Link href={`/eventos/${record.id}`}>
            <Button type="primary">Editar</Button>
          </Link>
          <Popconfirm
            title="¿Estás seguro de eliminar este evento?"
            onConfirm={() => deleteEvento(record.id)}
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
      dataSource={eventos}
      columns={columns}
      rowKey="id"
      loading={loading}
    />
  );
};

export default EventoList;
