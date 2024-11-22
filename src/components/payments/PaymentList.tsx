// src/components/payments/PaymentList.tsx

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
  Select,
} from "antd";
import { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import { SearchOutlined } from "@ant-design/icons";
import Link from "next/link";
import axios from "axios";
import { PaymentExtended } from "../../types/types";
import dayjs from "dayjs";
import Highlighter from "react-highlight-words";

const { RangePicker } = DatePicker;
const { Option } = Select;

const PaymentList: React.FC = () => {
  const [payments, setPayments] = useState<PaymentExtended[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState<{
    payment_id?: number;
    parent_id?: number;
    fee_id?: number;
    status?: string;
    payment_method?: string;
    min_amount?: number;
    max_amount?: number;
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
  ): ColumnsType<PaymentExtended>[number] => ({
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

  const fetchPayments = async (
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

      const response = await axios.get("/api/payments", { params });

      setPayments(response.data.data);
      setPagination({
        current: currentPage,
        pageSize: pageSize,
        total: response.data.pagination.total,
      });
    } catch (error) {
      message.error("Error al obtener la lista de pagos.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(pagination.current!, pagination.pageSize!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (payment_id: number) => {
    try {
      await axios.delete(`/api/payments/${payment_id}`);
      message.success("Pago eliminado exitosamente.");

      fetchPayments(
        pagination.current!,
        pagination.pageSize!,
        sorter,
        filters
      );
    } catch (error) {
      message.error("Error al eliminar el pago.");
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
        dataIndex === "payment_id" ||
          dataIndex === "parent_id" ||
          dataIndex === "fee_id"
          ? parseInt(selectedKeys[0], 10)
          : selectedKeys[0],
    }));

    fetchPayments(1, pagination.pageSize!, sorter, {
      ...filters,
      [dataIndex]:
        dataIndex === "payment_id" ||
          dataIndex === "parent_id" ||
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
      delete newFilters["payment_id"];
      delete newFilters["parent_id"];
      delete newFilters["fee_id"];
      delete newFilters["status"];
      delete newFilters["payment_method"];

      return newFilters;
    });

    fetchPayments(1, pagination.pageSize!, sorter, {});
    setPagination({ ...pagination, current: 1 });
  };

  const handleTableChange = (
    newPagination: TablePaginationConfig,
    _: any,
    sorterResult: SorterResult<PaymentExtended> | SorterResult<PaymentExtended>[]
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

    fetchPayments(newPagination.current!, newPagination.pageSize!, newSorter, filters);
    setPagination(newPagination);
  };

  const columns: ColumnsType<PaymentExtended> = [
    {
      title: "ID",
      dataIndex: "payment_id",
      key: "payment_id",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("payment_id"),
    },
    {
      title: "Padre",
      dataIndex: ["parent", "name"],
      key: "parent_name",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("parent_id"),
      render: (_: any, record: PaymentExtended) => record.parent.name,
    },
    {
      title: "Cuota",
      dataIndex: ["fee", "description"],
      key: "fee_description",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("fee_id"),
      render: (_: any, record: PaymentExtended) => record.fee.description,
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
      title: "Fecha",
      dataIndex: "date",
      key: "date",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("status"),
    },
    {
      title: "Método de Pago",
      dataIndex: "payment_method",
      key: "payment_method",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      ...getColumnSearchProps("payment_method"),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: PaymentExtended) => (
        <Space size="middle">
          <Link href={`/payments/${record.payment_id}`}>
            <Button type="primary">Editar</Button>
          </Link>
          <Popconfirm
            title="¿Estás seguro de eliminar este pago?"
            onConfirm={() => handleDelete(record.payment_id)}
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
      payment_id,
      parent_id,
      fee_id,
      status,
      payment_method,
      amount_range,
      date_range,
    } = values;

    const newFilters: any = {};

    if (payment_id) {
      newFilters.payment_id = payment_id;
    }

    if (parent_id) {
      newFilters.parent_id = parent_id;
    }

    if (fee_id) {
      newFilters.fee_id = fee_id;
    }

    if (status) {
      newFilters.status = status;
    }

    if (payment_method) {
      newFilters.payment_method = payment_method;
    }

    if (amount_range) {
      const [min, max] = amount_range;
      if (min !== undefined) newFilters.min_amount = min;
      if (max !== undefined) newFilters.max_amount = max;
    }

    if (date_range) {
      const [from, to] = date_range;
      if (from) newFilters.date_from = dayjs(from).format("YYYY-MM-DD");
      if (to) newFilters.date_to = dayjs(to).format("YYYY-MM-DD");
    }

    setFilters(newFilters);

    fetchPayments(1, pagination.pageSize!, sorter, newFilters);
    setPagination({ ...pagination, current: 1 });
  };

  const onReset = () => {
    form.resetFields();
    setFilters({});
    fetchPayments(1, pagination.pageSize!, sorter, {});
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
            <Form.Item label="ID del Pago" name="payment_id">
              <InputNumber placeholder="ID del Pago" min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="ID del Padre" name="parent_id">
              <InputNumber placeholder="ID del Padre" min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="ID de la Cuota" name="fee_id">
              <InputNumber placeholder="ID de la Cuota" min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Estado" name="status">
              <Select allowClear placeholder="Seleccionar Estado">
                <Option value="PENDING">Pendiente</Option>
                <Option value="COMPLETED">Completado</Option>
                <Option value="FAILED">Fallido</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Método de Pago" name="payment_method">
              <Select allowClear placeholder="Seleccionar Método">
                <Option value="CASH">Efectivo</Option>
                <Option value="CREDIT_CARD">Tarjeta de Crédito</Option>
                <Option value="DEBIT_CARD">Tarjeta de Débito</Option>
                <Option value="TRANSFER">Transferencia</Option>
              </Select>
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
          <Col span={12}>
            <Form.Item label="Rango de Fecha" name="date_range">
              <RangePicker style={{ width: "100%" }} />
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

      {/* Tabla de Pagos */}
      <Table
        dataSource={payments}
        columns={columns}
        rowKey="payment_id"
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

export default PaymentList;
