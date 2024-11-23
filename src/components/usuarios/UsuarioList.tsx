"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  message,
  Button,
  Space,
  Popconfirm,
  Form,
  Input,
  Select,
  Row,
  Col,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import axios from "axios";
import Link from "next/link";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  roles: string;
}

const { Option } = Select;

const UsuarioList: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  // Estado para filtros y ordenación
  const [filters, setFilters] = useState<{
    id?: number;
    nombre?: string;
    email?: string;
    roles?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    page: number;
    limit: number;
  }>({
    page: 1,
    limit: 10,
  });

  // Estado para la paginación
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50", "100"],
  });

  // Función para obtener usuarios con filtros, orden y paginación
  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const params: any = {};

      if (filters.id) params.id = filters.id;
      if (filters.nombre) params.nombre = filters.nombre;
      if (filters.email) params.email = filters.email;
      if (filters.roles) params.roles = filters.roles;
      if (filters.sortBy) {
        params.sortBy = filters.sortBy;
        params.sortOrder = filters.sortOrder;
      }
      params.page = filters.page;
      params.limit = filters.limit;

      const response = await axios.get("/api/usuarios", { params });
      setUsuarios(response.data.data);
      setPagination({
        current: response.data.pagination.page,
        pageSize: response.data.pagination.limit,
        total: response.data.pagination.total,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
      });
    } catch (error) {
      message.error("Error al cargar los usuarios.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, [filters]);

  // Manejar la eliminación de un usuario
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

  // Manejar el envío del formulario de filtros
  const onFinish = (values: any) => {
    const newFilters: typeof filters = {
      page: 1, // Reiniciar a la primera página al aplicar filtros
      limit: 10,
    };

    if (values.id) newFilters.id = Number(values.id);
    if (values.nombre) newFilters.nombre = values.nombre;
    if (values.email) newFilters.email = values.email;
    if (values.roles) newFilters.roles = values.roles;

    setFilters(newFilters);
  };

  // Manejar la limpieza de filtros
  const onReset = () => {
    form.resetFields();
    setFilters({
      page: 1,
      limit: 10,
    });
  };

  // Manejar cambios en la tabla (ordenación y paginación)
  const handleTableChange = (
    pagination: TablePaginationConfig,
    filtersTable: any,
    sorter: any
  ) => {
    let sortBy: string | undefined;

    if (sorter.field) {
      sortBy = sorter.field;
    }

    setFilters((prev) => ({
      ...prev,
      sortBy: sorter.order ? sortBy : undefined,
      sortOrder:
        sorter.order === "ascend"
          ? "asc"
          : sorter.order === "descend"
          ? "desc"
          : undefined,
      page: pagination.current || 1,
      limit: pagination.pageSize || 10,
    }));
  };

  // Definir las columnas con tipos correctos y ordenación
  const columns: ColumnsType<Usuario> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: true,
      sortOrder:
        filters.sortBy === "id"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : undefined,
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      sorter: true,
      sortOrder:
        filters.sortBy === "nombre"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : undefined,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: true,
      sortOrder:
        filters.sortBy === "email"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : undefined,
    },
    {
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
      sorter: true,
      sortOrder:
        filters.sortBy === "roles"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : undefined,
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
    <div>
      {/* Formulario de filtros */}
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16}>
          {/* ID */}
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="ID" name="id">
              <Input placeholder="ID" type="number" min={1} />
            </Form.Item>
          </Col>

          {/* Nombre */}
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Nombre" name="nombre">
              <Input placeholder="Nombre" />
            </Form.Item>
          </Col>

          {/* Email */}
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Email" name="email">
              <Input placeholder="Email" />
            </Form.Item>
          </Col>

          {/* Roles */}
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Roles" name="roles">
              <Select
                showSearch
                placeholder="Selecciona un rol"
                allowClear
                style={{ width: "100%" }}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  typeof option?.children === "string" &&
                  //@ts-expect-error not affecting de code
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {/* Reemplaza con tus roles reales */}
                <Option value="admin">Admin</Option>
                <Option value="usuario">Usuario</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24} style={{ textAlign: "right" }}>
            <Space>
              <Button type="primary" htmlType="submit">
                Filtrar
              </Button>
              <Button htmlType="button" onClick={onReset}>
                Limpiar
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>

      {/* Tabla de usuarios */}
      <Table
        dataSource={usuarios}
        columns={columns}
        rowKey="id"
        loading={loading}
        onChange={handleTableChange}
        pagination={pagination}
      />
    </div>
  );
};

export default UsuarioList;
