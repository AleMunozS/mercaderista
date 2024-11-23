"use client";

import React, { useEffect, useState } from "react";
import { Table, message, Button, Space, Popconfirm } from "antd";
import axios from "axios";
import Link from "next/link";

interface Item {
  id: number;
  nombre: string;
  itemCode: string;
  voucherLines: any[]; // Ajusta el tipo según tus necesidades
  cantidad: number;
  precio: number;
}

const ItemList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/items");
      setItems(response.data);
    } catch (error) {
      message.error("Error al cargar los items.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const deleteItem = async (id: number) => {
    try {
      await axios.delete(`/api/items/${id}`);
      message.success("Item eliminado exitosamente.");
      fetchItems();
    } catch (error) {
      message.error("Error al eliminar el item.");
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
      title: "Código de Item",
      dataIndex: "itemCode",
      key: "itemCode",
    },
    
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: Item) => (
        <Space size="middle">
          <Link href={`/items/${record.id}`}>
            <Button type="primary">Editar</Button>
          </Link>
          <Popconfirm
            title="¿Estás seguro de eliminar este item?"
            onConfirm={() => deleteItem(record.id)}
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
      dataSource={items}
      columns={columns}
      rowKey="id"
      loading={loading}
    />
  );
};

export default ItemList;
