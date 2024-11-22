// app/reports/outstandingPayments/components/OutstandingPaymentsTable.tsx
"use client";

import React from "react";
import { Table, Typography } from "antd";

const { Title } = Typography;

interface OutstandingPaymentsTableProps {
  academicYear: string;
  pendingPayments: any[];
}

const OutstandingPaymentsTable: React.FC<OutstandingPaymentsTableProps> = ({
  academicYear,
  pendingPayments,
}) => {
  const columns = [
    {
      title: "ID de Pago",
      dataIndex: "paymentId",
      key: "paymentId",
    },
    {
      title: "Nombre del Estudiante",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Nombre del Padre",
      dataIndex: "parentName",
      key: "parentName",
    },
    {
      title: "Monto Pendiente ($)",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: "Método de Pago",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
    },
    {
      title: "Fecha de Vencimiento",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Fecha de Registro",
      dataIndex: "date",
      key: "date",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <Title level={4}>
        Pagos Pendientes para el Año Académico {academicYear}
      </Title>
      <Table
        dataSource={pendingPayments}
        columns={columns}
        rowKey="paymentId"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default OutstandingPaymentsTable;
