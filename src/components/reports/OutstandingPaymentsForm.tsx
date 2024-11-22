// app/reports/outstandingPayments/components/OutstandingPaymentsForm.tsx
"use client";

import { Form, Input, Button } from "antd";
import { useState } from "react";

interface OutstandingPaymentsFormProps {
  onSubmit: (academicYear: number) => void;
}

const OutstandingPaymentsForm: React.FC<OutstandingPaymentsFormProps> = ({
  onSubmit,
}) => {
  const [loading, setLoading] = useState(false);

  const onFinish = (values: { academicYear: number }) => {
    setLoading(true);
    onSubmit(values.academicYear);
    setLoading(false);
  };

  return (
    <Form
      layout="vertical"
      onFinish={onFinish}
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

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Generar Reporte
        </Button>
      </Form.Item>
    </Form>
  );
};

export default OutstandingPaymentsForm;
