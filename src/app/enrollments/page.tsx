"use client";

import React from "react";
import { Typography, Button } from "antd";
import Link from "next/link";
import EnrollmentList from "@/components/enrollments/EnrollmentList";

const { Title } = Typography;

const EnrollmentsPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Administrar Inscripciones</Title>
      <Link href="/enrollments/create">
        <Button type="primary" style={{ marginBottom: "20px" }}>
          Registrar Nueva Inscripción
        </Button>
      </Link>
      <EnrollmentList />
    </div>
  );
};

export default EnrollmentsPage;
