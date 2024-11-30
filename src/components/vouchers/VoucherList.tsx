"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  message,
  Button,
  Space,
  Popconfirm,
  Tag,
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
} from "antd";
import axios from "axios";
import Link from "next/link";
import { Voucher } from "@/types/types";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import moment from "moment";

const { Option } = Select;
const { RangePicker } = DatePicker;

const VoucherList: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  // Estado para filtros y ordenación
  const [filters, setFilters] = useState<{
    id?: number;
    tipo?: string;
    usuarioNombre?: string;
    localNombre?: string;
    fechaDesde?: string;
    fechaHasta?: string;
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

  // Función para obtener vouchers con filtros, orden y paginación
  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const params: any = {};

      if (filters.id) params.id = filters.id;
      if (filters.tipo) params.tipo = filters.tipo;
      if (filters.usuarioNombre) params.usuarioNombre = filters.usuarioNombre;
      if (filters.localNombre) params.localNombre = filters.localNombre;
      if (filters.fechaDesde) params.fechaDesde = filters.fechaDesde;
      if (filters.fechaHasta) params.fechaHasta = filters.fechaHasta;
      if (filters.sortBy) {
        params.sortBy = filters.sortBy;
        params.sortOrder = filters.sortOrder;
      }
      params.page = filters.page;
      params.limit = filters.limit;

      const response = await axios.get("/api/vouchers", { params });
      setVouchers(response.data.data);
      setPagination({
        current: response.data.pagination.page,
        pageSize: response.data.pagination.limit,
        total: response.data.pagination.total,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
      });
    } catch (error) {
      message.error("Error al cargar los vouchers.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [filters]);

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

  // Manejar el envío del formulario de filtros
  const onFinish = (values: any) => {
    const newFilters: typeof filters = {
      page: 1, // Reiniciar a la primera página al aplicar filtros
      limit: filters.limit,
    };

    if (values.id) newFilters.id = Number(values.id);
    if (values.tipo) newFilters.tipo = values.tipo;
    if (values.usuarioNombre) newFilters.usuarioNombre = values.usuarioNombre;
    if (values.localNombre) newFilters.localNombre = values.localNombre;
    if (values.fecha) {
      newFilters.fechaDesde = values.fecha[0].format("YYYY-MM-DD");
      newFilters.fechaHasta = values.fecha[1].format("YYYY-MM-DD");
    }

    setFilters(newFilters);
  };

  // Manejar la limpieza de filtros
  const onReset = () => {
    form.resetFields();
    setFilters({
      page: 1,
      limit: filters.limit,
    });
  };

  // Manejar cambios en la tabla (ordenación y paginación)
  const handleTableChange = (
    pagination: TablePaginationConfig,
    filtersTable: any,
    sorter: any
  ) => {
    let sortBy: string | undefined;

    if (sorter.field && ["id", "tipo", "createdAt"].includes(sorter.field)) {
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
  const columns: ColumnsType<Voucher> = [
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
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
      sorter: true,
      sortOrder:
        filters.sortBy === "tipo"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      filters: [
        { text: "Inventario", value: "inventario" },
        { text: "Merma", value: "merma" },
        // Agrega más opciones si es necesario
      ],
      onFilter: (value, record) => record.tipo === value,
      render: (tipo: string) => (
        <Tag color={tipo.toLowerCase() === "inventario" ? "green" : "red"}>
        {tipo}
      </Tag>
      ),
    },
    {
      title: "Usuario",
      dataIndex: ["usuario", "nombre"],
      key: "usuario",
      // No podemos ordenar por campos relacionados directamente
    },
    {
      title: "Local",
      dataIndex: ["local", "nombre"],
      key: "local",
      // No podemos ordenar por campos relacionados directamente
    },
    {
      title: "Fecha",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      sortOrder:
        filters.sortBy === "createdAt"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : undefined,
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

          {/* Tipo */}
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Tipo" name="tipo">
              <Select placeholder="Selecciona un tipo" allowClear>
                <Option value="inventario">Inventario</Option>
                <Option value="merma">merma</Option>
                {/* Agrega más opciones si es necesario */}
              </Select>
            </Form.Item>
          </Col>

          {/* Usuario Nombre */}
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Usuario Nombre" name="usuarioNombre">
              <Input placeholder="Nombre del usuario" />
            </Form.Item>
          </Col>

          {/* Local Nombre */}
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Local Nombre" name="localNombre">
              <Input placeholder="Nombre del local" />
            </Form.Item>
          </Col>

          {/* Fecha */}
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Fecha" name="fecha">
              <RangePicker format="YYYY-MM-DD" />
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

      {/* Tabla de vouchers */}
      <Table
        dataSource={vouchers}
        columns={columns}
        rowKey="id"
        loading={loading}
        onChange={handleTableChange}
        pagination={pagination}
      />
    </div>
  );
};

export default VoucherList;
