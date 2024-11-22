// app/reports/pendingFees/components/PendingFeesForm.tsx
"use client";

import { Form, Input, Button, Select, DatePicker, InputNumber } from "antd";
import { useState } from "react";

const { Option } = Select;
const { RangePicker } = DatePicker;

interface PendingFeesFormProps {
  onSubmit: (filters: any) => void;
}

const PendingFeesForm: React.FC<PendingFeesFormProps> = ({ onSubmit }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = (values: any) => {
    setLoading(true);
    const filters: any = {
      academicYear: values.academicYear,
    };

    if (values.studentName) {
      filters.studentName = values.studentName;
    }

    if (values.grade) {
      filters.grade = values.grade;
    }

    if (values.parentName) {
      filters.parentName = values.parentName;
    }

    if (values.paymentMethod) {
      filters.paymentMethod = values.paymentMethod;
    }

    if (values.dueDate) {
      filters.dueDateFrom = values.dueDate[0].startOf("day").toISOString();
      filters.dueDateTo = values.dueDate[1].endOf("day").toISOString();
    }

    if (values.minPendingAmount) {
      filters.minPendingAmount = values.minPendingAmount;
    }

    if (values.maxPendingAmount) {
      filters.maxPendingAmount = values.maxPendingAmount;
    }

    onSubmit(filters);
    setLoading(false);
  };

  return (
    <Form
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        academicYear: new Date().getFullYear(),
      }}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        alignItems: "flex-end",
        marginBottom: "20px",
      }}
    >
      <Form.Item
        label="Año Académico"
        name="academicYear"
        rules={[
          { required: true, message: "Por favor ingresa el año académico" },
          {
            validator: (_, value) => {
              if (!value || (value >= 2000 && value <= 2100)) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error("Ingresa un año válido entre 2000 y 2100")
              );
            },
          },
        ]}
        style={{ flex: "1 1 150px" }}
      >
        <Input
          type="number"
          placeholder="e.g., 2023"
          style={{ width: "100%" }}
        />
      </Form.Item>

      <Form.Item
        label="Nombre del Estudiante"
        name="studentName"
        style={{ flex: "1 1 200px" }}
      >
        <Input placeholder="Buscar por nombre" allowClear />
      </Form.Item>

      <Form.Item label="Grado" name="grade" style={{ flex: "1 1 150px" }}>
        <Select placeholder="Selecciona un grado" allowClear>
          <Option value="1° Grado">1° Grado</Option>
          <Option value="2° Grado">2° Grado</Option>
          <Option value="3° Grado">3° Grado</Option>
          <Option value="4° Grado">4° Grado</Option>
          <Option value="5° Grado">5° Grado</Option>
          <Option value="6° Grado">6° Grado</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Nombre del Padre"
        name="parentName"
        style={{ flex: "1 1 200px" }}
      >
        <Input placeholder="Buscar por nombre del padre" allowClear />
      </Form.Item>

      <Form.Item
        label="Método de Pago"
        name="paymentMethod"
        style={{ flex: "1 1 200px" }}
      >
        <Select placeholder="Selecciona un método de pago" allowClear>
          <Option value="CASH">Efectivo</Option>
          <Option value="CREDIT_CARD">Tarjeta de Crédito</Option>
          <Option value="DEBIT_CARD">Tarjeta de Débito</Option>
          <Option value="TRANSFER">Transferencia</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Rango de Fechas de Vencimiento"
        name="dueDate"
        style={{ flex: "1 1 300px" }}
      >
        <RangePicker format="YYYY-MM-DD" allowClear />
      </Form.Item>

      <Form.Item
        label="Monto Pendiente Mínimo ($)"
        name="minPendingAmount"
        style={{ flex: "1 1 150px" }}
      >
        <InputNumber
          min={0}
          style={{ width: "100%" }}
          placeholder="e.g., 100"
        />
      </Form.Item>

      <Form.Item
        label="Monto Pendiente Máximo ($)"
        name="maxPendingAmount"
        style={{ flex: "1 1 150px" }}
      >
        <InputNumber
          min={0}
          style={{ width: "100%" }}
          placeholder="e.g., 1000"
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Generar Reporte
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PendingFeesForm;
