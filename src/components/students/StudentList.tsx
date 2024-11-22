// components/students/StudentList.tsx

"use client";

import { Table, Button, Space, message, Popconfirm, Input } from "antd";
import { ColumnsType, TablePaginationConfig } from "antd/es/table";
import Link from "next/link";
import axios from "axios";
import { useState, useEffect } from "react";
import { FilterValue, SorterResult, FilterDropdownProps } from "antd/es/table/interface";

interface Parent {
  parent_id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Student {
  student_id: number;
  name: string;
  grade: string;
  parent_id: number;
  parent: Parent;
}


type StudentFilterKeys = keyof Student | "parent_name" | "parent_email";


const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<Record<string, string | null>>({});
  const [sorter, setSorter] = useState<{ field?: string; order?: "asc" | "desc" }>({});


  const buildQueryString = () => {
    const params = new URLSearchParams();


    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });


    if (sorter.field && sorter.order) {
      params.append("sortField", sorter.field);
      params.append("sortOrder", sorter.order);
    }

    return params.toString();
  };


  const fetchStudents = async () => {
    setLoading(true);
    try {
      const queryString = buildQueryString();
      const response = await axios.get(`/api/students?${queryString}`);
      setStudents(response.data.data);
    } catch (error) {
      message.error("Error al obtener la lista de estudiantes.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sorter]);


  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/students/${id}`);
      message.success("Estudiante eliminado exitosamente.");
      fetchStudents();
    } catch (error) {
      message.error("Error al eliminar el estudiante.");
      console.error(error);
    }
  };


  const handleTableChange = (
    pagination: TablePaginationConfig,
    tableFilters: Record<string, FilterValue | null>,
    sorterParam: SorterResult<Student> | SorterResult<Student>[]
  ) => {
    if (!Array.isArray(sorterParam)) {
      setSorter({
        field: sorterParam.field as string,
        order: sorterParam.order === "ascend" ? "asc" : sorterParam.order === "descend" ? "desc" : undefined,
      });
    }

    setFilters({
      name: (tableFilters.name || [])[0] as string | null,
      grade: (tableFilters.grade || [])[0] as string | null,
      parent_name: (tableFilters.parent_name || [])[0] as string | null,
      parent_email: (tableFilters.parent_email || [])[0] as string | null,
    });
  };


  const getColumnSearchProps = (dataIndex: StudentFilterKeys) => ({
    filterDropdown: (props: FilterDropdownProps) => {
      const { setSelectedKeys, selectedKeys, confirm, clearFilters } = props;
      return (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={`Buscar ${dataIndex}`}
            value={selectedKeys[0] as string}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
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
                if (clearFilters) {
                  clearFilters();
                }
                confirm();
              }}
              size="small"
              style={{ width: 90 }}
            >
              Limpiar
            </Button>

          </Space>
        </div>
      );
    },
    filterIcon: (filtered: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{ color: filtered ? "#1890ff" : undefined }}
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


  const columns: ColumnsType<Student> = [
    {
      title: "ID",
      dataIndex: "student_id",
      key: "student_id",
      sorter: true,
      ...getColumnSearchProps("student_id"),
    },
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      sorter: true,
      ...getColumnSearchProps("name"),
    },
    {
      title: "Grado",
      dataIndex: "grade",
      key: "grade",
      sorter: true,
      ...getColumnSearchProps("grade"),
    },
    {
      title: "Nombre del Padre",
      dataIndex: "parent_name",
      key: "parent_name",
      sorter: true,
      ...getColumnSearchProps("parent_name"),
      render: (_, record) => record.parent.name,
    },
    {
      title: "Correo del Padre",
      dataIndex: "parent_email",
      key: "parent_email",
      sorter: true,
      ...getColumnSearchProps("parent_email"),
      render: (_, record) => record.parent.email,
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Link href={`/students/${record.student_id}`}>
            <Button type="primary">Editar</Button>
          </Link>
          <Popconfirm
            title="¿Estás seguro de eliminar este estudiante?"
            onConfirm={() => handleDelete(record.student_id)}
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
      dataSource={students}
      columns={columns}
      rowKey="student_id"
      loading={loading}
      pagination={{ pageSize: 10 }}
      onChange={handleTableChange}
    />
  );
};

export default StudentList;
