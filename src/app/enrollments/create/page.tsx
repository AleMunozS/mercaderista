"use client";

import React from "react";
import { Typography, Button } from "antd";
import Link from "next/link";
import EnrollmentForm from "@/components/enrollments/EnrollmentForm";

const { Title } = Typography;

const CreateEnrollmentPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Registrar Nueva Inscripción</Title>
      <EnrollmentForm />
      <Link href="/enrollments">
        <Button style={{ marginTop: "20px" }}>Volver a la Lista</Button>
      </Link>
    </div>
  );
};

export default CreateEnrollmentPage;
