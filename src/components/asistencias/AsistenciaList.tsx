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
  DatePicker,
  Row,
  Col,
  Progress,
  Modal,
} from "antd";
import axios from "axios";
import Link from "next/link";
import { Asistencia } from "@/types/types";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import moment from "moment";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const { RangePicker } = DatePicker;

const AsistenciaList: React.FC = () => {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  // Estado para filtros y ordenación
  const [filters, setFilters] = useState<{
    id?: number;
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

  // Estados para exportación
  const [exporting, setExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportModalVisible, setExportModalVisible] = useState<boolean>(false);
  const [exportTotalPages, setExportTotalPages] = useState<number>(0);
  const [exportFetchedPages, setExportFetchedPages] = useState<number>(0);

  // Función para obtener asistencias con filtros, orden y paginación
  const fetchAsistencias = async () => {
    setLoading(true);
    try {
      const params: any = {};

      if (filters.id) params.id = filters.id;
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

      const response = await axios.get("/api/asistencias", { params });
      setAsistencias(response.data.data);
      setPagination({
        current: response.data.pagination.page,
        pageSize: response.data.pagination.limit,
        total: response.data.pagination.total,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
      });
    } catch (error) {
      message.error("Error al cargar las asistencias.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsistencias();
  }, [filters]);

  const deleteAsistencia = async (id: number) => {
    try {
      await axios.delete(`/api/asistencias/${id}`);
      message.success("Asistencia eliminada exitosamente.");
      fetchAsistencias();
    } catch (error) {
      message.error("Error al eliminar la asistencia.");
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

    if (sorter.field && sorter.order) {
      // Si sorter.field es un arreglo, convertirlo a notación de puntos
      if (Array.isArray(sorter.field)) {
        sortBy = sorter.field.join(".");
      } else {
        sortBy = sorter.field;
      }
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
      const initialResponse = await axios.get("/api/asistencias", {
        params: initialParams,
      });
      const total = initialResponse.data.pagination.total;
      const limit = 100; // Usar un límite alto para reducir el número de solicitudes
      const totalPages = Math.ceil(total / limit);
      setExportTotalPages(totalPages);

      const allAsistencias: Asistencia[] = [];

      // Función para obtener una página específica
      const fetchPage = async (page: number) => {
        const params = { ...filters, page, limit };
        const response = await axios.get("/api/asistencias", { params });
        return response.data.data as Asistencia[];
      };

      // Iterar secuencialmente para actualizar el progreso de manera clara
      for (let page = 1; page <= totalPages; page++) {
        const data = await fetchPage(page);
        allAsistencias.push(...data);
        setExportFetchedPages(page);
        setExportProgress(Math.round((page / totalPages) * 100));
      }

      // Generar el archivo Excel
      const worksheet = XLSX.utils.json_to_sheet(
        allAsistencias.map((item) => ({
          ID: item.id,
          Usuario: item.usuario.nombre,
          Local: item.local.nombre,
          "Check-In": new Date(item.checkInTime).toLocaleString(),
          "Check-Out": item.checkOutTime
            ? new Date(item.checkOutTime).toLocaleString()
            : "N/A",
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencias");
      const excelBuffer = XLSX.write(workbook, {
        type: "array",
        bookType: "xlsx",
      });
      const blob = new Blob([excelBuffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "Asistencias.xlsx");

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
  const columns: ColumnsType<Asistencia> = [
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
      title: "Usuario",
      dataIndex: ["usuario", "nombre"],
      key: "usuario.nombre",
      sorter: true,
      sortOrder:
        filters.sortBy === "usuario.nombre"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : undefined,
    },
    {
      title: "Local",
      dataIndex: ["local", "nombre"],
      key: "local.nombre",
      sorter: true,
      sortOrder:
        filters.sortBy === "local.nombre"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : undefined,
    },
    {
      title: "Check-In",
      dataIndex: "checkInTime",
      key: "checkInTime",
      sorter: true,
      sortOrder:
        filters.sortBy === "checkInTime"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Check-Out",
      dataIndex: "checkOutTime",
      key: "checkOutTime",
      sorter: true,
      sortOrder:
        filters.sortBy === "checkOutTime"
          ? filters.sortOrder === "asc"
            ? "ascend"
            : "descend"
          : undefined,
      render: (date: string) =>
        date ? new Date(date).toLocaleString() : "N/A",
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: Asistencia) => (
        <Space size="middle">
          <Link href={`/asistencias/${record.id}`}>
            <Button type="primary">Editar</Button>
          </Link>
          <Popconfirm
            title="¿Estás seguro de eliminar esta asistencia?"
            onConfirm={() => deleteAsistencia(record.id)}
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

      {/* Tabla de asistencias */}
      <Table
        dataSource={asistencias}
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

export default AsistenciaList;
