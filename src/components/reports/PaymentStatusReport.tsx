// app/reports/paymentStatusSummary/PaymentStatusReport.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Pie } from "@ant-design/charts";
import { Alert, Spin } from "antd";

const PaymentStatusReport: React.FC = () => {
  const [data] = useState([
    { type: "Completado", value: 1500, count: 30 },
    { type: "Pendiente", value: 500, count: 10 },
    { type: "Fallido", value: 200, count: 5 },
  ]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    // fetchStatusSummary(); // Comentado para usar datos de prueba
  }, []);

  const config = {
    data,
    angleField: "value",
    colorField: "type",
    radius: 1,
    interactions: [{ type: "element-active" }],
  };

  return (
    <div style={{ padding: "20px" }}>
      {loading ? (
        <Spin tip="Cargando..." />
      ) : error ? (
        <Alert message="Error" description={error} type="error" showIcon />
      ) : (
        <Pie {...config} />
      )}
    </div>
  );
};

export default PaymentStatusReport;
