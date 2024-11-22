// app/fees/[fee_id]/page.tsx

"use client";

import { useParams } from "next/navigation";
import { Typography, Spin, message, Button } from "antd";
import FeeForm from "@/components/fees/FeeForm";
import axios from "axios";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FeeExtended, FeeFormInputValues } from "../../../types/types";
import dayjs from "dayjs";

const { Title } = Typography;

const EditFeePage: React.FC = () => {
  const { fee_id } = useParams();
  const [fee, setFee] = useState<FeeExtended | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchFee = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/fees/${fee_id}`);
      setFee(response.data);
    } catch (error) {
      message.error("Error al obtener los datos de la cuota.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fee_id) {
      fetchFee();
    }
  }, [fee_id]);

  if (loading) {
    return <Spin />;
  }

  if (!fee) {
    return <div>No se encontró la cuota.</div>;
  }

  const initialFormValues: FeeFormInputValues = {
    description: fee.description,
    amount: fee.amount,
    due_date: fee.due_date ? dayjs(fee.due_date) : null,
    student_id: fee.student_id,
  };

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Editar Cuota</Title>
      <FeeForm initialValues={initialFormValues} feeId={fee.fee_id} />
      <Link href="/fees">
        <Button style={{ marginTop: "20px" }}>Volver a la Lista</Button>
      </Link>
    </div>
  );
};

export default EditFeePage;
