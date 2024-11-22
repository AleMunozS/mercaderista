// app/reports/outstandingPayments/OutstandingPaymentsReport.tsx
"use client";

import React, { useState } from "react";
import { Spin, Alert } from "antd";
import OutstandingPaymentsForm from "./OutstandingPaymentsForm";
import OutstandingPaymentsTable from "./OutstandingPaymentsTable";

const OutstandingPaymentsReport: React.FC = () => {
  const [academicYear, setAcademicYear] = useState<string>("");
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOutstandingPayments = async (year: number) => {
    setLoading(true);
    setError(null);
    setPendingPayments([]);
    setAcademicYear("");

    try {
      const queryParams = new URLSearchParams();
      queryParams.append("academicYear", year.toString());

      const res = await fetch(
        `/api/reports/outstandingPayments?${queryParams.toString()}`
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error desconocido");
      }

      const data = await res.json();
      setAcademicYear(data.academicYear);
      setPendingPayments(data.pendingPayments);
    } catch (err: any) {
      setError(err.message || "Error al obtener el reporte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Aquí puedes reutilizar el formulario de TotalPaymentsReport si ya tienes uno que filtra por año académico */}
      <OutstandingPaymentsForm onSubmit={fetchOutstandingPayments} />

      {loading && <Spin tip="Cargando..." />}

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginTop: "20px" }}
        />
      )}

      {pendingPayments.length > 0 && academicYear && (
        <OutstandingPaymentsTable
          academicYear={academicYear}
          pendingPayments={pendingPayments}
        />
      )}

      {pendingPayments.length === 0 && !loading && academicYear && (
        <Alert
          message="No hay pagos pendientes"
          description={`No se encontraron pagos pendientes para el año académico ${academicYear}.`}
          type="info"
          showIcon
          style={{ marginTop: "20px" }}
        />
      )}
    </div>
  );
};

export default OutstandingPaymentsReport;
