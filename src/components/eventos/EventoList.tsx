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
  DatePicker,
  Col,
  Row,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import axios from "axios";
import Link from "next/link";
import { Evento, Usuario } from "@/types/types";


const { RangePicker } = DatePicker;
const { Option } = Select;

const EventoList: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form] = Form.useForm();

  // Estado para filtros y ordenación
  const [filters, setFilters] = useState<{
    id?: number;
    usuarioId?: number;
    mensaje?: string;
    createdAt?: string;
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
    pageSizeOptions: ['10', '20', '50', '100'],
  });

  // Obtener la lista de usuarios para el filtro
  const fetchUsuarios = async () => {
    try {
      const response = await axios.get("/api/usuarios"); // Asegúrate de tener esta API
      setUsuarios(response.data.data);
    } catch (error) {
      message.error("Error al cargar los usuarios.");
      console.error(error);
    }
  };

  // Función para obtener eventos con filtros, orden y paginación
  const fetchEventos = async () => {
    setLoading(true);
    try {
      const params: any = {};

      if (filters.id) params.id = filters.id;
      if (filters.usuarioId) params.usuarioId = filters.usuarioId;
      if (filters.mensaje) params.mensaje = filters.mensaje;
      if (filters.createdAt) params.createdAt = filters.createdAt;
      if (filters.sortBy) {
        params.sortBy = filters.sortBy;
        params.sortOrder = filters.sortOrder;
      }
      params.page = filters.page;
      params.limit = filters.limit;

      const response = await axios.get("/api/eventos", { params });
      setEventos(response.data.data); // Ajusta según la estructura de tu respuesta
      setPagination({
        current: response.data.pagination.page,
        pageSize: response.data.pagination.limit,
        total: response.data.pagination.total,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
      });
    } catch (error) {
      message.error("Error al cargar los eventos.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchEventos();
  }, []);

  // Manejar la eliminación de un evento
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

  // Manejar el envío del formulario de filtros
  const onFinish = (values: any) => {
    const newFilters: typeof filters = {
      page: 1, // Reiniciar a la primera página al aplicar filtros
      limit: 10,
    };

    if (values.id) newFilters.id = Number(values.id);
    if (values.usuarioId) newFilters.usuarioId = Number(values.usuarioId);
    if (values.mensaje) newFilters.mensaje = values.mensaje;
    if (values.createdAt) {
      newFilters.createdAt = values.createdAt[0].toISOString();
      // Opcional: Si deseas filtrar por un rango completo, necesitarás ajustar la API para aceptar fechas de inicio y fin
      // newFilters.createdAtTo = values.createdAt[1].toISOString();
    }

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

    // Verificar si sorter.field es un array (para campos anidados)
    if (Array.isArray(sorter.field)) {
      sortBy = sorter.field.join('.'); // Convierte ["usuario", "nombre"] a "usuario.nombre"
    } else if (sorter.field === "usuario") {
      sortBy = "usuario.nombre"; // Mapea "usuario" a "usuario.nombre"
    } else {
      sortBy = sorter.field;
    }

    setFilters((prev) => ({
      ...prev,
      sortBy: sorter.order ? sortBy : undefined,
      sortOrder: sorter.order === "ascend" ? "asc" : sorter.order === "descend" ? "desc" : undefined,
      page: pagination.current || 1,
      limit: pagination.pageSize || 10,
    }));
  };

  // Actualizar eventos cuando los filtros cambian
  useEffect(() => {
    fetchEventos();
  }, [filters]);

  // Definir las columnas con tipos correctos
  const columns: ColumnsType<Evento> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: true,
      sortOrder: filters.sortBy === "id" ? (filters.sortOrder === "asc" ? "ascend" : "descend") : undefined,
    },
    {
      title: "Usuario",
      dataIndex: ["usuario", "nombre"],
      key: "usuario.nombre", // Cambiado para reflejar el campo anidado
      sorter: true,
      sortOrder:
        filters.sortBy === "usuario.nombre"
          ? filters.sortOrder === "asc" ? "ascend" : "descend"
          : undefined,
      render: (_: any, record: Evento) => record.usuario.nombre,
    },
    {
      title: "Mensaje",
      dataIndex: "mensaje",
      key: "mensaje",
      sorter: true,
      sortOrder: filters.sortBy === "mensaje" ? (filters.sortOrder === "asc" ? "ascend" : "descend") : undefined,
    },
    {
      title: "Fecha",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      sortOrder: filters.sortBy === "createdAt" ? (filters.sortOrder === "asc" ? "ascend" : "descend") : undefined,
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
    <div>
      {/* Formulario de filtros */}
      <Form
  form={form}
  layout="vertical" // Cambia a "vertical" para un diseño más limpio
  onFinish={onFinish}
  style={{ marginBottom: 16 }}
>
  <Row gutter={16}>
    {/* ID */}
    <Col xs={24} sm={12} md={8} lg={6}>
      <Form.Item label="ID" name="id">
        <Input placeholder="ID" type="number" min={1} />
      </Form.Item>
    </Col>

    {/* Usuario */}
    <Col xs={24} sm={12} md={8} lg={6}>
      <Form.Item label="Usuario" name="usuarioId">
        <Select
          showSearch
          placeholder="Selecciona un usuario"
          allowClear
          style={{ width: '100%' }}
          optionFilterProp="children"
          filterOption={(input, option) =>
            typeof option?.children === 'string' &&
            // @ts-expect-error not affecting de code
            option.children.toLowerCase().includes(input.toLowerCase())
          }
        >
          {usuarios.map((usuario) => (
            <Option key={usuario.id} value={usuario.id}>
              {usuario.nombre}
            </Option>
          ))}
        </Select>
      </Form.Item>
    </Col>

    {/* Mensaje */}
    <Col xs={24} sm={12} md={8} lg={6}>
      <Form.Item label="Mensaje" name="mensaje">
        <Input placeholder="Mensaje" />
      </Form.Item>
    </Col>

    {/* Fecha */}
    <Col xs={24} sm={12} md={8} lg={6}>
      <Form.Item label="Fecha" name="createdAt">
        <RangePicker style={{ width: '100%' }} />
      </Form.Item>
    </Col>
  </Row>

  <Row>
    <Col span={24} style={{ textAlign: 'right' }}>
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

      {/* Tabla de eventos */}
      <Table
        dataSource={eventos}
        columns={columns}
        rowKey="id"
        loading={loading}
        onChange={handleTableChange}
        pagination={pagination}
      />
    </div>
  );
};

export default EventoList;
