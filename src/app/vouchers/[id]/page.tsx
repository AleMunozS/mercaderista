// src/app/vouchers/[id]/page.tsx

"use client";

import React from "react";
import { useParams } from "next/navigation";
import VoucherDetails from "@/components/vouchers/VoucherDetails";


const VoucherPage = () => {
  const params = useParams();
  const voucherId = params?.id ? Number(params.id) : null;

  if (!voucherId) {
    return <div>Voucher ID no proporcionado.</div>;
  }

  return <VoucherDetails voucherId={voucherId} />;
};

export default VoucherPage;
