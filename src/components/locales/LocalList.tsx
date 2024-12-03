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

interface Local {
  id: number;
  nombre: string;
  direccion: string;
  supermercado: string;
}

const LocalList: React.FC = () => {
  const [locales, setLocales] = useState<Local[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  // Estado para filtros y ordenación
  const [filters, setFilters] = useState<{
    id?: number;
    nombre?: string;
    direccion?: string;
    supermercado?: string;
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

  // Función para obtener locales con filtros, orden y paginación
  const fetchLocales = async () => {
    setLoading(true);
    try {
      const params: any = {};

      if (filters.id) params.id = filters.id;
      if (filters.nombre) params.nombre = filters.nombre;
      if (filters.direccion) params.direccion = filters.direccion;
      if (filters.supermercado) params.supermercado = filters.supermercado;
      if (filters.sortBy) {
        params.sortBy = filters.sortBy;
        params.sortOrder = filters.sortOrder;
      }
      params.page = filters.page;
      params.limit = filters.limit;

      const response = await axios.get("/api/locales", { params });

      setLocales(response.data.data);
      setPagination({
        current: response.data.pagination.page,
        pageSize: response.data.pagination.limit,
        total: response.data.pagination.total,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
      });
    } catch (error) {
      message.error("Error al cargar los locales.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocales();
  }, [filters]);

  // Manejar la eliminación de un local
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

  // Manejar el envío del formulario de filtros
  const onFinish = (values: any) => {
    const newFilters: typeof filters = {
      page: 1, // Reiniciar a la primera página al aplicar filtros
      limit: filters.limit,
    };

    if (values.id) newFilters.id = Number(values.id);
    if (values.nombre) newFilters.nombre = values.nombre;
    if (values.direccion) newFilters.direccion = values.direccion;
    if (values.supermercado) newFilters.supermercado = values.supermercado;

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
      const initialResponse = await axios.get("/api/locales", {
        params: initialParams,
      });
      const total = initialResponse.data.pagination.total;
      const limit = 100; // Usar un límite alto para reducir el número de solicitudes
      const totalPages = Math.ceil(total / limit);
      setExportTotalPages(totalPages);

      const allLocales: Local[] = [];

      // Función para obtener una página específica
      const fetchPage = async (page: number) => {
        const params = { ...filters, page, limit };
        const response = await axios.get("/api/locales", { params });
        return response.data.data as Local[];
      };

      // Iterar secuencialmente para actualizar el progreso de manera clara
      for (let page = 1; page <= totalPages; page++) {
        const data = await fetchPage(page);
        allLocales.push(...data);
        setExportFetchedPages(page);
        setExportProgress(Math.round((page / totalPages) * 100));
      }

      // Generar el archivo Excel
      const worksheet = XLSX.utils.json_to_sheet(
        allLocales.map((local) => ({
          ID: local.id,
          Nombre: local.nombre,
          Dirección: local.direccion,
          Supermercado: local.supermercado,
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Locales");
      const excelBuffer = XLSX.write(workbook, {
        type: "array",
        bookType: "xlsx",
      });
      const blob = new Blob([excelBuffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "Locales.xlsx");

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
  const columns: ColumnsType<Local> = [
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
      title: "Dirección",
      dataIndex: "direccion",
      key: "direccion",
      sorter: true,
      sortOrder:
        filters.sortBy === "direccion"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : undefined,
    },
    {
      title: "Supermercado",
      dataIndex: "supermercado",
      key: "supermercado",
      sorter: true,
      sortOrder:
        filters.sortBy === "supermercado"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : undefined,
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

          {/* Dirección */}
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Dirección" name="direccion">
              <Input placeholder="Dirección" />
            </Form.Item>
          </Col>

          {/* Supermercado */}
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Supermercado" name="supermercado">
              <Input placeholder="Supermercado" />
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

      {/* Tabla de locales */}
      <Table
        dataSource={locales}
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

export default LocalList;
