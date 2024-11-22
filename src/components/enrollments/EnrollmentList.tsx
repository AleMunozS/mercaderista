// src/components/enrollments/EnrollmentList.tsx

"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  message,
  Button,
  Space,
  Popconfirm,
  Input,
  InputNumber,
  DatePicker,
  Form,
  Row,
  Col,

} from "antd";
import { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import { SearchOutlined } from "@ant-design/icons";
import Link from "next/link";
import axios from "axios";
import { EnrollmentExtended } from "../../types/types";
import dayjs from "dayjs";
import Highlighter from "react-highlight-words";

const { RangePicker } = DatePicker;


const EnrollmentList: React.FC = () => {
  const [enrollments, setEnrollments] = useState<EnrollmentExtended[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState<{
    enrollment_id?: number;
    student_id?: number;
    grade?: string;
    academic_year?: string;
    date_from?: string;
    date_to?: string;
  }>({});
  const [sorter, setSorter] = useState<{
    sort_by?: string;
    sort_order?: string;
  }>({});
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const searchInput = useRef<any>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [searchedColumn, setSearchedColumn] = useState<string>("");


  const getColumnSearchProps = (
    dataIndex: string
  ): ColumnsType<EnrollmentExtended>[number] => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: any) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Buscar ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Buscar
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Resetear
          </Button>
        </Space>
      </div>
    ),
    filterIcon: () => (
      null
    ),
    onFilterDropdownVisibleChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text: string) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const fetchEnrollments = async (
    currentPage: number = 1,
    pageSize: number = 10,
    currentSorter = sorter,
    currentFilters = filters
  ) => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: pageSize,
        ...currentSorter,
        ...currentFilters,
      };

      const response = await axios.get("/api/enrollments", { params });

      console.log('Respuesta de la API:', response.data);

      setEnrollments(response.data.data);
      setPagination({
        current: currentPage,
        pageSize: pageSize,
        total: response.data.pagination.total,
      });
    } catch (error) {
      message.error("Error al obtener la lista de inscripciones.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments(pagination.current!, pagination.pageSize!);

  }, []);

  const handleDelete = async (enrollment_id: number) => {
    try {
      await axios.delete(`/api/enrollments/${enrollment_id}`);
      message.success("Inscripción eliminada exitosamente.");

      fetchEnrollments(
        pagination.current!,
        pagination.pageSize!,
        sorter,
        filters
      );
    } catch (error) {
      message.error("Error al eliminar la inscripción.");
      console.error(error);
    }
  };


  const handleSearch = (
    selectedKeys: string[],
    confirm: () => void,
    dataIndex: string
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);

    setFilters((prev) => ({
      ...prev,
      [dataIndex]:
        dataIndex === "enrollment_id" ||
          dataIndex === "student_id"
          ? parseInt(selectedKeys[0], 10)
          : selectedKeys[0],
    }));

    fetchEnrollments(1, pagination.pageSize!, sorter, {
      ...filters,
      [dataIndex]:
        dataIndex === "enrollment_id" ||
          dataIndex === "student_id"
          ? parseInt(selectedKeys[0], 10)
          : selectedKeys[0],
    });
    setPagination({ ...pagination, current: 1 });
  };


  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
    setSearchedColumn("");

    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters["enrollment_id"];
      delete newFilters["student_id"];
      delete newFilters["grade"];
      delete newFilters["academic_year"];
      delete newFilters["date_from"];
      delete newFilters["date_to"];
      return newFilters;
    });

    fetchEnrollments(1, pagination.pageSize!, sorter, {});
    setPagination({ ...pagination, current: 1 });
  };

  const handleTableChange = (
    newPagination: TablePaginationConfig,
    _: any,
    sorterResult: SorterResult<EnrollmentExtended> | SorterResult<EnrollmentExtended>[]
  ) => {
    let sort_by: string | undefined;
    let sort_order: string | undefined;

    if (!Array.isArray(sorterResult)) {
      sort_by = sorterResult.field as string;
      sort_order = sorterResult.order
        ? sorterResult.order === "ascend"
          ? "asc"
          : "desc"
        : undefined;
    }

    const newSorter = {
      sort_by,
      sort_order,
    };
    setSorter(newSorter);

    fetchEnrollments(newPagination.current!, newPagination.pageSize!, newSorter, filters);
    setPagination(newPagination);
  };

  const columns: ColumnsType<EnrollmentExtended> = [
    {
      title: "ID",
      dataIndex: "enrollment_id",
      key: "enrollment_id",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("enrollment_id"),
    },
    {
      title: "Estudiante",
      dataIndex: ["student", "name"],
      key: "student_name",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("student_id"),
      render: (_: any, record: EnrollmentExtended) => record.student.name,
    },
    {
      title: "Grado",
      dataIndex: "grade",
      key: "grade",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("grade"),
    },
    {
      title: "Año Académico",
      dataIndex: "academic_year",
      key: "academic_year",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("academic_year"),
    },
    {
      title: "Fecha de Inscripción",
      dataIndex: "enrollment_date",
      key: "enrollment_date",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: EnrollmentExtended) => (
        <Space size="middle">
          <Link href={`/enrollments/${record.enrollment_id}`}>
            <Button type="primary">Editar</Button>
          </Link>
          <Popconfirm
            title="¿Estás seguro de eliminar esta inscripción?"
            onConfirm={() => handleDelete(record.enrollment_id)}
            okText="Sí"
            cancelText="No"
          >
            <Button danger>Eliminar</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];


  const onFinish = (values: any) => {
    const {
      enrollment_id,
      student_id,
      grade,
      academic_year,
      date_range,
    } = values;

    const newFilters: any = {};

    if (enrollment_id) {
      newFilters.enrollment_id = enrollment_id;
    }

    if (student_id) {
      newFilters.student_id = student_id;
    }

    if (grade) {
      newFilters.grade = grade;
    }

    if (academic_year) {
      newFilters.academic_year = academic_year;
    }

    if (date_range) {
      const [from, to] = date_range;
      if (from) newFilters.date_from = dayjs(from).format("YYYY-MM-DD");
      if (to) newFilters.date_to = dayjs(to).format("YYYY-MM-DD");
    }

    setFilters(newFilters);

    fetchEnrollments(1, pagination.pageSize!, sorter, newFilters);
    setPagination({ ...pagination, current: 1 });
  };

  const onReset = () => {
    form.resetFields();
    setFilters({});
    fetchEnrollments(1, pagination.pageSize!, sorter, {});
    setPagination({ ...pagination, current: 1 });
  };

  return (
    <div>
      {/* Barra de Filtros Avanzados */}
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="ID de la Inscripción" name="enrollment_id">
              <InputNumber placeholder="ID de la Inscripción" min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="ID del Estudiante" name="student_id">
              <InputNumber placeholder="ID del Estudiante" min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Grado" name="grade">
              <Input placeholder="Grado" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Año Académico" name="academic_year">
              <Input placeholder="Año Académico" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Rango de Fecha de Inscripción" name="date_range">
              <RangePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          {/* Puedes agregar más filtros si es necesario */}
        </Row>
        <Row gutter={16} justify="end">
          <Col>
            <Button type="primary" htmlType="submit">
              Buscar
            </Button>
          </Col>
          <Col>
            <Button onClick={onReset}>Resetear</Button>
          </Col>
        </Row>
      </Form>

      {/* Tabla de Inscripciones */}
      <Table
        dataSource={enrollments}
        columns={columns}
        rowKey="enrollment_id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default EnrollmentList;
