"use client";

import React, { useEffect, useState } from "react";
import { Typography, Spin, message, Button } from "antd";
import { useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import PaymentForm from "@/components/payments/PaymentForm";
import {
  PaymentExtended,
  PaymentFormInputValues,
} from "../../../types/types";

const { Title } = Typography;

const EditPaymentPage: React.FC = () => {
  const { payment_id } = useParams();
  const [payment, setPayment] = useState<PaymentExtended | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPayment = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/payments/${payment_id}`);
      setPayment(response.data);
    } catch (error) {
      message.error("Error al obtener los datos del pago.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (payment_id) {
      fetchPayment();
    }
  }, [payment_id]);

  if (loading) {
    return <Spin />;
  }

  if (!payment) {
    return <div>No se encontró el pago.</div>;
  }

  const initialFormValues: PaymentFormInputValues = {
    parent_id: payment.parent_id,
    fee_id: payment.fee_id,
    amount: payment.amount,
    status: payment.status,
    payment_method: payment.payment_method,
  };

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Editar Pago</Title>
      <PaymentForm
        initialValues={initialFormValues}
        paymentId={payment.payment_id}
      />
      <Link href="/payments">
        <Button style={{ marginTop: "20px" }}>Volver a la Lista</Button>
      </Link>
    </div>
  );
};

export default EditPaymentPage;
