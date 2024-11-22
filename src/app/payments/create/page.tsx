"use client";

import React from "react";
import { Typography, Button } from "antd";
import Link from "next/link";
import PaymentForm from "@/components/payments/PaymentForm";

const { Title } = Typography;

const CreatePaymentPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Registrar Nuevo Pago</Title>
      <PaymentForm />
      <Link href="/payments">
        <Button style={{ marginTop: "20px" }}>Volver a la Lista</Button>
      </Link>
    </div>
  );
};

export default CreatePaymentPage;
