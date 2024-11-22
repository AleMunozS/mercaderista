"use client";

import React from "react";
import { Typography, Button } from "antd";
import Link from "next/link";
import PaymentList from "@/components/payments/PaymentList";

const { Title } = Typography;

const PaymentsPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Administrar Pagos</Title>
      <Link href="/payments/create">
        <Button type="primary" style={{ marginBottom: "20px" }}>
          Registrar Nuevo Pago
        </Button>
      </Link>
      <PaymentList />
    </div>
  );
};

export default PaymentsPage;
