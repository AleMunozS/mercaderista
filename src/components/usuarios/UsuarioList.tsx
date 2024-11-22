"use client";

import React, { useEffect, useState } from "react";
import { Table, message, Button, Space, Popconfirm } from "antd";
import axios from "axios";
import Link from "next/link";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  roles: string;
}

const UsuarioList: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/usuarios");
      setUsuarios(response.data);
    } catch (error) {
      message.error("Error al cargar los usuarios.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const deleteUsuario = async (id: number) => {
    try {
      await axios.delete(`/api/usuarios/${id}`);
      message.success("Usuario eliminado exitosamente.");
      fetchUsuarios();
    } catch (error) {
      message.error("Error al eliminar el usuario.");
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
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: Usuario) => (
        <Space size="middle">
          <Link href={`/usuarios/${record.id}`}>
            <Button type="primary">Editar</Button>
          </Link>
          <Popconfirm
            title="¿Estás seguro de eliminar este usuario?"
            onConfirm={() => deleteUsuario(record.id)}
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
      dataSource={usuarios}
      columns={columns}
      rowKey="id"
      loading={loading}
    />
  );
};

export default UsuarioList;
