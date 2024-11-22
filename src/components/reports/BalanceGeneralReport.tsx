// app/reports/balanceGeneral/BalanceGeneralReport.tsx
"use client";

import React, { useState } from "react";
import { Spin, Alert } from "antd";
import BalanceForm from "./BalanceForm";
import BalanceResult from "./BalanceResult";

const BalanceGeneralReport: React.FC = () => {
  const [academicYear, setAcademicYear] = useState<string>("");
  const [totalIngresos, setTotalIngresos] = useState<number | null>(null);
  const [totalGastos, setTotalGastos] = useState<number | null>(null);
  const [balanceNeto, setBalanceNeto] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalanceGeneral = async (year: number) => {
    setLoading(true);
    setError(null);
    setTotalIngresos(null);
    setTotalGastos(null);
    setBalanceNeto(null);
    setAcademicYear("");

    try {
      const queryParams = new URLSearchParams();
      queryParams.append("academicYear", year.toString());

      const res = await fetch(
        `/api/reports/balanceGeneral?${queryParams.toString()}`
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error desconocido");
      }

      const data = await res.json();
      setAcademicYear(data.academicYear);
      setTotalIngresos(data.totalIngresos);
      setTotalGastos(data.totalGastos);
      setBalanceNeto(data.balanceNeto);
    } catch (err: any) {
      setError(err.message || "Error al obtener el reporte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <BalanceForm onSubmit={fetchBalanceGeneral} />

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

      {totalIngresos !== null &&
        totalGastos !== null &&
        balanceNeto !== null &&
        academicYear && (
          <BalanceResult
            academicYear={academicYear}
            totalIngresos={totalIngresos}
            totalGastos={totalGastos}
            balanceNeto={balanceNeto}
          />
        )}
    </div>
  );
};

export default BalanceGeneralReport;
