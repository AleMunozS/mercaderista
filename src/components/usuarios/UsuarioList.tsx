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
  Progress,
  Modal,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import axios from "axios";
import Link from "next/link";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  roles: string;
  // password?: string; // Asegúrate de no incluir la contraseña en la interfaz si no la necesitas
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

  // Estados para exportación
  const [exporting, setExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportModalVisible, setExportModalVisible] = useState<boolean>(false);
  const [exportTotalPages, setExportTotalPages] = useState<number>(0);
  const [exportFetchedPages, setExportFetchedPages] = useState<number>(0);

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
      limit: filters.limit,
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

  // Función para exportar a Excel
  const exportToExcel = async () => {
    setExporting(true);
    setExportModalVisible(true);
    setExportFetchedPages(0);

    try {
      // Primero, obtener el total de registros para calcular el número de páginas
      const initialParams = { ...filters, page: 1, limit: 1 };
      const initialResponse = await axios.get("/api/usuarios", {
        params: initialParams,
      });
      const total = initialResponse.data.pagination.total;
      const limit = 100; // Usar un límite alto para reducir el número de solicitudes
      const totalPages = Math.ceil(total / limit);
      setExportTotalPages(totalPages);

      const allUsuarios: Usuario[] = [];

      // Función para obtener una página específica
      const fetchPage = async (page: number) => {
        const params = { ...filters, page, limit };
        const response = await axios.get("/api/usuarios", { params });
        return response.data.data as Usuario[];
      };

      // Iterar secuencialmente para actualizar el progreso de manera clara
      for (let page = 1; page <= totalPages; page++) {
        const data = await fetchPage(page);
        allUsuarios.push(...data);
        setExportFetchedPages(page);
        setExportProgress(Math.round((page / totalPages) * 100));
      }

      // Generar el archivo Excel
      const worksheet = XLSX.utils.json_to_sheet(
        allUsuarios.map((usuario) => ({
          ID: usuario.id,
          Nombre: usuario.nombre,
          Email: usuario.email,
          Roles: usuario.roles,
          // Asegúrate de **no incluir** la contraseña si está presente
          // Contraseña: usuario.password, // OMITIR
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");
      const excelBuffer = XLSX.write(workbook, {
        type: "array",
        bookType: "xlsx",
      });
      const blob = new Blob([excelBuffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "Usuarios.xlsx");

      message.success("Exportación a Excel completada exitosamente.");
    } catch (error) {
      message.error("Error al exportar los datos a Excel.");
      console.error(error);
    } finally {
      setExporting(false);
      setExportModalVisible(false);
      setExportProgress(0);
      setExportTotalPages(0);
      setExportFetchedPages(0);
    }
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
        layout="vertical" // Cambia a "vertical" para un diseño más limpio
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
                  (option.children as string)
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {/* Reemplaza con tus roles reales */}
                <Option value="admin">Admin</Option>
                <Option value="usuario">Usuario</Option>
                {/* Añade más opciones según sea necesario */}
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
              <Button
                type="default"
                onClick={exportToExcel}
                disabled={exporting}
              >
                Exportar a Excel
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

      {/* Modal de progreso de exportación */}
      <Modal
        title="Exportando a Excel"
        visible={exportModalVisible}
        footer={null}
        closable={false}
      >
        <p>
          Exportando registros: {exportFetchedPages} / {exportTotalPages} páginas
        </p>
        <Progress percent={exportProgress} />
      </Modal>
    </div>
  );
};

export default UsuarioList;
