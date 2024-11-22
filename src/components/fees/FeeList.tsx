// src/components/fees/FeeList.tsx

"use client";

import {
  Table,
  Button,
  Space,
  message,
  Popconfirm,
  Input,
  InputNumber,
  DatePicker,
  Form,
  Row,
  Col,
  Tag,
  Select,
} from "antd";
import { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import { SearchOutlined } from "@ant-design/icons";
import Link from "next/link";
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { FeeExtended, FeesResponse } from "../../types/types";
import dayjs from "dayjs";
import Highlighter from "react-highlight-words";

const { RangePicker } = DatePicker;
const { Option } = Select;

const FeeList: React.FC = () => {
  const [fees, setFees] = useState<FeeExtended[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState<{
    fee_id?: number;
    description?: string;
    student_name?: string;
    min_amount?: number;
    max_amount?: number;
    due_date_from?: string;
    due_date_to?: string;
    status?: string;
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
  ): ColumnsType<FeeExtended>[number] => ({
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
      <SearchOutlined style={{ color: searchedColumn === dataIndex ? '#1890ff' : undefined }} />
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

  const fetchFees = async (
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

      const response = await axios.get<FeesResponse>("/api/fees", { params });

      console.log('Respuesta de la API:', response.data);

      setFees(response.data.data);
      setPagination({
        current: currentPage,
        pageSize: pageSize,
        total: response.data.pagination.total,
      });
    } catch (error) {
      message.error("Error al obtener la lista de cuotas.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees(pagination.current!, pagination.pageSize!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (fee_id: number) => {
    try {
      await axios.delete(`/api/fees/${fee_id}`);
      message.success("Cuota eliminada exitosamente.");

      fetchFees(
        pagination.current!,
        pagination.pageSize!,
        sorter,
        filters
      );
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Error al eliminar la cuota.";
      message.error(errorMessage);
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
        dataIndex === "fee_id"
          ? parseInt(selectedKeys[0], 10)
          : selectedKeys[0],
    }));

    fetchFees(1, pagination.pageSize!, sorter, {
      ...filters,
      [dataIndex]:
        dataIndex === "fee_id"
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
      delete newFilters["fee_id"];
      delete newFilters["description"];
      delete newFilters["student_name"];
      delete newFilters["min_amount"];
      delete newFilters["max_amount"];
      delete newFilters["due_date_from"];
      delete newFilters["due_date_to"];
      delete newFilters["status"];
      return newFilters;
    });

    fetchFees(1, pagination.pageSize!, sorter, {});
    setPagination({ ...pagination, current: 1 });
  };

  const handleTableChange = (
    newPagination: TablePaginationConfig,
    _: any,
    sorterResult: SorterResult<FeeExtended> | SorterResult<FeeExtended>[]
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

    fetchFees(newPagination.current!, newPagination.pageSize!, newSorter, filters);
    setPagination(newPagination);
  };

  const columns: ColumnsType<FeeExtended> = [
    {
      title: "ID",
      dataIndex: "fee_id",
      key: "fee_id",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("fee_id"),
    },
    {
      title: "Descripción",
      dataIndex: "description",
      key: "description",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("description"),
      render: (text: string) => text,
    },
    {
      title: "Monto",
      dataIndex: "amount",
      key: "amount",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: "Fecha de Vencimiento",
      dataIndex: "due_date",
      key: "due_date",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Estudiante",
      dataIndex: ["student", "name"],
      key: "student_name",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("student_name"),
      render: (_: any, record: FeeExtended) => record.student.name,
    },
    {
      title: "Total Pagado",
      dataIndex: "total_paid",
      key: "total_paid",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (total_paid: number) => `$${total_paid.toFixed(2)}`,
    },
    {
      title: "Monto Restante",
      dataIndex: "remaining_amount",
      key: "remaining_amount",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (remaining_amount: number) => `$${remaining_amount.toFixed(2)}`,
    },
    {
      title: "Estado",
      dataIndex: "is_paid",
      key: "is_paid",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (is_paid: boolean) =>
        is_paid ? (
          <Tag color="green">Pagada</Tag>
        ) : (
          <Tag color="red">Pendiente</Tag>
        ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Link href={`/fees/${record.fee_id}`}>
            <Button type="primary">Editar</Button>
          </Link>
          <Popconfirm
            title="¿Estás seguro de eliminar esta cuota?"
            onConfirm={() => handleDelete(record.fee_id)}
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

  const onFinish = (values: any) => {
    const {
      fee_id,
      description,
      student_name,
      amount_range,
      due_date_range,
      status,
    } = values;

    const newFilters: any = {};

    if (fee_id) {
      newFilters.fee_id = fee_id;
    }

    if (description) {
      newFilters.description = description;
    }

    if (student_name) {
      newFilters.student_name = student_name;
    }

    if (amount_range) {
      const [min, max] = amount_range;
      if (min !== undefined) newFilters.min_amount = min;
      if (max !== undefined) newFilters.max_amount = max;
    }

    if (due_date_range) {
      const [from, to] = due_date_range;
      if (from) newFilters.due_date_from = dayjs(from).format("YYYY-MM-DD");
      if (to) newFilters.due_date_to = dayjs(to).format("YYYY-MM-DD");
    }

    if (status) {
      newFilters.is_paid = status === "COMPLETED" ? true : false;
    }

    setFilters(newFilters);

    fetchFees(1, pagination.pageSize!, sorter, newFilters);
    setPagination({ ...pagination, current: 1 });
  };

  const onReset = () => {
    form.resetFields();
    setFilters({});
    fetchFees(1, pagination.pageSize!, sorter, {});
    setPagination({ ...pagination, current: 1 });
  };

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="ID de la Cuota" name="fee_id">
              <InputNumber placeholder="ID de la Cuota" min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Descripción" name="description">
              <Input placeholder="Descripción" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Nombre del Estudiante" name="student_name">
              <Input placeholder="Nombre del Estudiante" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Rango de Monto" name="amount_range">
              <Input.Group compact>
                <Form.Item
                  name={["amount_range", 0]}
                  noStyle
                >
                  <InputNumber
                    placeholder="Mínimo"
                    min={0}
                    style={{ width: "50%" }}
                  />
                </Form.Item>
                <Form.Item
                  name={["amount_range", 1]}
                  noStyle
                >
                  <InputNumber
                    placeholder="Máximo"
                    min={0}
                    style={{ width: "50%" }}
                  />
                </Form.Item>
              </Input.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Rango de Fecha de Vencimiento" name="due_date_range">
              <RangePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Estado" name="status">
              <Select placeholder="Selecciona el estado" allowClear>
                <Option value="COMPLETED">Completada</Option>
                <Option value="PENDING">Pendiente</Option>
              </Select>
            </Form.Item>
          </Col>
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

      <Table
        dataSource={fees}
        columns={columns}
        rowKey="fee_id"
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

export default FeeList;
