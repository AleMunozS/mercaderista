"use client";

import React from "react";
import { Typography, Button } from "antd";
import Link from "next/link";
import VoucherList from "@/components/vouchers/VoucherList";


const { Title } = Typography;

const VouchersPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Administrar Vouchers</Title>
      <Link href="/vouchers/create">
        <Button type="primary" style={{ marginBottom: "20px" }}>
          Agregar Nuevo Voucher
        </Button>
      </Link>
      <VoucherList />
    </div>
  );
};

export default VouchersPage;
