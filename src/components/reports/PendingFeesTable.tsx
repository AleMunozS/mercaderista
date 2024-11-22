// app/reports/pendingFees/components/PendingFeesTable.tsx
"use client";

import { Table, Typography, Tag, Button, Space } from "antd";
import { ColumnsType } from "antd/es/table";
import { PendingFee } from "./PendingFeesReport";

const { Title } = Typography;

interface PendingFeesTableProps {
  academicYear: string;
  pendingFees: PendingFee[];
}

const PendingFeesTable: React.FC<PendingFeesTableProps> = ({
  academicYear,
  pendingFees,
}) => {
  const columns: ColumnsType<PendingFee> = [
    {
      title: "ID de Cuota",
      dataIndex: "feeId",
      key: "feeId",
      sorter: (a, b) => a.feeId - b.feeId,
    },
    {
      title: "Descripción",
      dataIndex: "description",
      key: "description",
      sorter: (a, b) => a.description.localeCompare(b.description),
    },
    {
      title: "Monto Total ($)",
      dataIndex: "amountTotal",
      key: "amountTotal",
      sorter: (a, b) => a.amountTotal - b.amountTotal,
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: "Monto Pagado ($)",
      dataIndex: "montoPagado",
      key: "montoPagado",
      sorter: (a, b) => a.montoPagado - b.montoPagado,
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: "Monto Pendiente ($)",
      dataIndex: "montoPendiente",
      key: "montoPendiente",
      sorter: (a, b) => a.montoPendiente - b.montoPendiente,
      render: (amount: number) => {
        const color = amount > 500 ? "red" : amount > 100 ? "orange" : "green";
        return <Tag color={color}>${amount.toFixed(2)}</Tag>;
      },
    },
    {
      title: "Fecha de Vencimiento",
      dataIndex: "dueDate",
      key: "dueDate",
      sorter: (a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Nombre del Estudiante",
      dataIndex: "studentName",
      key: "studentName",
      sorter: (a, b) => a.studentName.localeCompare(b.studentName),
    },
    {
      title: "Nombre del Padre",
      dataIndex: "parentName",
      key: "parentName",
      sorter: (a, b) => a.parentName.localeCompare(b.parentName),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleSendReminder(record.feeId)}>
            Enviar Recordatorio
          </Button>
        </Space>
      ),
    },
  ];

  const handleSendReminder = (feeId: number) => {
    console.log(`Enviar recordatorio para la cuota ID: ${feeId}`);
  };

  return (
    <div>
      <Title level={4}>
        Cuotas Pendientes para el Año Académico {academicYear}
      </Title>
      <Table
        dataSource={pendingFees}
        columns={columns}
        rowKey="feeId"
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
      />
    </div>
  );
};

export default PendingFeesTable;
