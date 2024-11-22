// app/reports/totalPayments/components/PaymentReportForm.tsx
'use client';

import { Form, Input, Button, Select } from 'antd';
import { useState } from 'react';

const { Option } = Select;

interface PaymentReportFormProps {
  onSubmit: (filters: ReportFilters) => void;
}

export interface ReportFilters {
  academicYear: number;
  paymentMethod?: string;
  paymentStatus?: string;
  grade?: string;
}

const PaymentReportForm: React.FC<PaymentReportFormProps> = ({ onSubmit }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = (values: any) => {
    setLoading(true);
    onSubmit(values);
    setLoading(false);
  };

  return (
    <Form
      layout="vertical"
      onFinish={onFinish}
      style={{
        display: 'flex',
        flexWrap: 'wrap', // Permite que los elementos salten a otra fila si no caben en una
        gap: '16px', // Espaciado entre elementos
        alignItems: 'flex-end', // Alinea los elementos para que los botones queden alineados con los campos de entrada
        marginBottom: '20px',
      }}
    >
      <Form.Item
        label="Año Académico"
        name="academicYear"
        rules={[
          { required: true, message: 'Por favor ingresa el año académico' },
          {
            validator: (_, value) => {
              if (!value || (value >= 2000 && value <= 2100)) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Ingresa un año válido entre 2000 y 2100'));
            },
          },
        ]}
        style={{ flex: '1 1 150px' }} // Ajusta el tamaño del campo
      >
        <Input
          type="number"
          placeholder="e.g., 2023"
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item label="Método de Pago" name="paymentMethod" style={{ flex: '1 1 200px' }}>
        <Select placeholder="Selecciona un método de pago" allowClear style={{ width: '100%' }}>
          <Option value="CASH">Efectivo</Option>
          <Option value="CREDIT_CARD">Tarjeta de Crédito</Option>
          <Option value="DEBIT_CARD">Tarjeta de Débito</Option>
          <Option value="TRANSFER">Transferencia</Option>
        </Select>
      </Form.Item>

      <Form.Item label="Estado del Pago" name="paymentStatus" style={{ flex: '1 1 200px' }}>
        <Select placeholder="Selecciona el estado del pago" allowClear style={{ width: '100%' }}>
          <Option value="PENDING">Pendiente</Option>
          <Option value="COMPLETED">Completado</Option>
          <Option value="FAILED">Fallido</Option>
        </Select>
      </Form.Item>

      <Form.Item label="Grado" name="grade" style={{ flex: '1 1 200px' }}>
        <Select placeholder="Selecciona un grado" allowClear style={{ width: '100%' }}>
          <Option value="1">1° Grado</Option>
          <Option value="2">2° Grado</Option>
          <Option value="3">3° Grado</Option>
        </Select>
      </Form.Item>

      <Form.Item style={{ flex: '0 0 auto' }}> {/* Alinea el botón al final */}
        <Button type="primary" htmlType="submit" loading={loading}>
          Obtener Informe
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PaymentReportForm;
