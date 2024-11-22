// components/parents/ParentList.tsx

"use client";

import { Table, Button, Space, message, Popconfirm, Input } from "antd";
import { TablePaginationConfig } from "antd/es/table";
import Link from "next/link";
import axios from "axios";
import { useState, useEffect } from "react";
import { FilterValue, SorterResult } from "antd/es/table/interface";

interface Parent {
  parent_id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

const ParentList: React.FC = () => {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<Record<string, string | null>>({
    name: null,
    email: null,
    phone: null,
    address: null,
  });
  const [sorter, setSorter] = useState<{ field?: string; order?: 'asc' | 'desc' }>({});


  const buildQueryString = () => {
    const params = new URLSearchParams();


    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });


    if (sorter.field && sorter.order) {
      params.append('sortField', sorter.field);
      params.append('sortOrder', sorter.order);
    }

    return params.toString();
  };

  const fetchParents = async () => {
    setLoading(true);
    try {
      const queryString = buildQueryString();
      const response = await axios.get(`/api/parents?${queryString}`);
      setParents(response.data.data);
    } catch (error) {
      message.error("Error al obtener la lista de padres.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sorter]);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/parents/${id}`);
      message.success("Padre eliminado exitosamente.");
      fetchParents();
    } catch (error) {
      message.error("Error al eliminar el padre.");
      console.error(error);
    }
  };


  const handleTableChange = (
    pagination: TablePaginationConfig,
    tableFilters: Record<string, FilterValue | null>,
    sorterParam: SorterResult<Parent> | SorterResult<Parent>[],

  ) => {

    if (!Array.isArray(sorterParam)) {
      setSorter({
        field: sorterParam.field as string,
        order:
          sorterParam.order === 'ascend'
            ? 'asc'
            : sorterParam.order === 'descend'
              ? 'desc'
              : undefined,
      });
    }

    // Manejar filtros
    setFilters({
      name: tableFilters.name ? (tableFilters.name[0] as string) : null,
      email: tableFilters.email ? (tableFilters.email[0] as string) : null,
      phone: tableFilters.phone ? (tableFilters.phone[0] as string) : null,
      address: tableFilters.address ? (tableFilters.address[0] as string) : null,
    });
  };


  const getColumnSearchProps = (dataIndex: keyof Parent) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: {
      setSelectedKeys: (keys: React.Key[]) => void;
      selectedKeys: React.Key[];
      confirm: () => void;
      clearFilters: () => void;
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Buscar ${dataIndex}`}
          value={selectedKeys[0] as string}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            size="small"
            style={{ width: 90 }}
          >
            Buscar
          </Button>
          <Button
            onClick={() => {
              clearFilters();
              confirm();
            }}
            size="small"
            style={{ width: 90 }}
          >
            Limpiar
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{ color: filtered ? '#1890ff' : undefined }}
        width="16"
        height="16"
        fill="currentColor"
        className="bi bi-search"
        viewBox="0 0 16 16"
      >
        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.242 1.656a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
      </svg>
    ),

  });

  const columns: any = [
    {
      title: "ID",
      dataIndex: "parent_id",
      key: "parent_id",
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      ...getColumnSearchProps('parent_id'),
    },
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      ...getColumnSearchProps('name'),
    },
    {
      title: "Correo Electrónico",
      dataIndex: "email",
      key: "email",
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      ...getColumnSearchProps('email'),
    },
    {
      title: "Teléfono",
      dataIndex: "phone",
      key: "phone",
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      ...getColumnSearchProps('phone'),
    },
    {
      title: "Dirección",
      dataIndex: "address",
      key: "address",
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      ...getColumnSearchProps('address'),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Link href={`/parents/${record.parent_id}`}>
            <Button type="primary">Editar</Button>
          </Link>
          <Popconfirm
            title="¿Estás seguro de eliminar este padre?"
            onConfirm={() => handleDelete(record.parent_id)}
            okText="Sí"
            cancelText="No"
          >
            <Button type="primary" danger>
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={parents}
      columns={columns}
      rowKey="parent_id"
      loading={loading}
      pagination={{ pageSize: 10 }}
      onChange={handleTableChange}
    />
  );
};

export default ParentList;
