"use client";

import React, { useEffect, useState } from "react";
import { Typography, message } from "antd";
import { useRouter, useParams } from "next/navigation";
import VoucherForm from "@/components/vouchers/VoucherForm";
import axios from "axios";

const { Title } = Typography;

const EditVoucherPage: React.FC = () => {
  const { id } = useParams();
  const [initialValues, setInitialValues] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        const response = await axios.get(`/api/vouchers/${id}`);
        setInitialValues(response.data);
      } catch (error) {
        message.error("Error al cargar el voucher.");
        console.error(error);
        router.push("/vouchers");
      } finally {
        setLoading(false);
      }
    };
    fetchVoucher();
  }, [id, router]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Editar Voucher</Title>
      <VoucherForm initialValues={initialValues} voucherId={Number(id)} />
    </div>
  );
};

export default EditVoucherPage;
