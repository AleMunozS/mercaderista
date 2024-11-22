"use client";

import React, { useEffect, useState } from "react";
import { Table, message, Button, Space, Popconfirm } from "antd";
import { EmployeeExtended } from "@/types/types";
import axios from "axios";
import Link from "next/link";

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeExtended[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/employees");
      setEmployees(response.data);
    } catch (error) {
      message.error("Error al cargar los empleados.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const deleteEmployee = async (employee_id: number) => {
    try {
      await axios.delete(`/api/employees/${employee_id}`);
      message.success("Empleado eliminado exitosamente.");
      fetchEmployees();
    } catch (error) {
      message.error("Error al eliminar el empleado.");
      console.error(error);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "employee_id",
      key: "employee_id",
    },
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Correo Electrónico",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Teléfono",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Posición",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "Salario",
      dataIndex: "salary",
      key: "salary",
      render: (salary: number) => `$${salary.toFixed(2)}`,
    },
    {
      title: "Fecha de Inicio",
      dataIndex: "start_date",
      key: "start_date",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: EmployeeExtended) => (
        <Space size="middle">
          <Link href={`/employees/${record.employee_id}`}>
            <Button type="primary">Editar</Button>
          </Link>
          <Popconfirm
            title="¿Estás seguro de eliminar este empleado?"
            onConfirm={() => deleteEmployee(record.employee_id)}
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
    <Table
      dataSource={employees}
      columns={columns}
      rowKey="employee_id"
      loading={loading}
    />
  );
};

export default EmployeeList;
