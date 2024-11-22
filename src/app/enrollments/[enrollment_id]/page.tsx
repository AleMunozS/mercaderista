// src/app/enrollments/[enrollment_id]/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { Typography, Spin, message, Button } from "antd";
import { useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import EnrollmentForm from "@/components/enrollments/EnrollmentForm";
import {
  EnrollmentExtended,
  EnrollmentFormValues,
} from "../../../types/types";

const { Title } = Typography;

const EditEnrollmentPage: React.FC = () => {
  const { enrollment_id } = useParams();
  const [enrollment, setEnrollment] = useState<EnrollmentExtended | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchEnrollment = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/enrollments/${enrollment_id}`);
      setEnrollment(response.data);
    } catch (error) {
      message.error("Error al obtener los datos de la inscripción.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enrollment_id) {
      fetchEnrollment();
    }
  }, [enrollment_id]);

  if (loading) {
    return <Spin />;
  }

  if (!enrollment) {
    return <div>No se encontró la inscripción.</div>;
  }

  const initialFormValues: EnrollmentFormValues = {
    student_id: enrollment.student_id,
    grade: enrollment.grade,
    academic_year: enrollment.academic_year,
  };

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Editar Inscripción</Title>
      <EnrollmentForm
        initialValues={initialFormValues}
        enrollmentId={enrollment.enrollment_id}
      />
      <Link href="/enrollments">
        <Button style={{ marginTop: "20px" }}>Volver a la Lista</Button>
      </Link>
    </div>
  );
};

export default EditEnrollmentPage;
