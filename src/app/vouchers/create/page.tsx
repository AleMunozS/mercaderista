"use client";

import React from "react";
import { Typography } from "antd";
import VoucherForm from "@/components/vouchers/VoucherForm";

const { Title } = Typography;

const CreateVoucherPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Crear Nuevo Voucher</Title>
      <VoucherForm />
    </div>
  );
};

export default CreateVoucherPage;
