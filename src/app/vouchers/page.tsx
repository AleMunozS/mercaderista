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
      
      <VoucherList />
    </div>
  );
};

export default VouchersPage;
