"use client";

import React, { useEffect, useState } from "react";
import { Table, message, Button, Space, Popconfirm, Tag } from "antd";
import axios from "axios";
import Link from "next/link";
import { Voucher } from "@/types/types";

const VoucherList: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/vouchers");
      setVouchers(response.data);
    } catch (error) {
      message.error("Error al cargar los vouchers.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const deleteVoucher = async (id: number) => {
    try {
      await axios.delete(`/api/vouchers/${id}`);
      message.success("Voucher eliminado exitosamente.");
      fetchVouchers();
    } catch (error) {
      message.error("Error al eliminar el voucher.");
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
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
      render: (tipo: string) => (
        <Tag color={tipo === "inventario" ? "green" : "red"}>{tipo}</Tag>
      ),
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
      title: "Fecha",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: Voucher) => (
        <Space size="middle">
          <Link href={`/vouchers/${record.id}`}>
            <Button type="primary">Ver/Editar</Button>
          </Link>
          <Popconfirm
            title="¿Estás seguro de eliminar este voucher?"
            onConfirm={() => deleteVoucher(record.id)}
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
      dataSource={vouchers}
      columns={columns}
      rowKey="id"
      loading={loading}
    />
  );
};

export default VoucherList;
