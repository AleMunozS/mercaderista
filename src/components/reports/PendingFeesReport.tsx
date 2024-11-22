// app/reports/pendingFees/PendingFeesReport.tsx
"use client";

import React, { useState } from "react";
import { Spin, Alert, Button, Drawer, message } from "antd";
import PendingFeesForm from "./PendingFeesForm";
import PendingFeesTable from "./PendingFeesTable";
import { FilterOutlined, FileSearchOutlined } from "@ant-design/icons";

export interface PendingFee {
  feeId: number;
  description: string;
  amountTotal: number;
  montoPagado: number;
  montoPendiente: number;
  dueDate: string;
  studentName: string;
  parentName: string;
  studentId: number;
  parentId: number;
}

const PendingFeesReport: React.FC = () => {
  const [academicYear, setAcademicYear] = useState<string>("");
  const [pendingFees, setPendingFees] = useState<PendingFee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isDrawerVisible, setIsDrawerVisible] = useState<boolean>(false);

  const getCurrentAcademicYear = (): number => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // Enero = 0, Diciembre = 11
    return month >= 8 ? year : year - 1; // Septiembre (8) o después
  };

  const fetchPendingFees = async (filters: any) => {
    setLoading(true);
    setError(null);
    setPendingFees([]);
    setAcademicYear("");

    try {
      const queryParams = new URLSearchParams();
      queryParams.append("academicYear", filters.academicYear.toString());

      if (filters.studentName) {
        queryParams.append("studentName", filters.studentName);
      }

      if (filters.grade) {
        queryParams.append("grade", filters.grade);
      }

      if (filters.parentName) {
        queryParams.append("parentName", filters.parentName);
      }

      if (filters.paymentMethod) {
        queryParams.append("paymentMethod", filters.paymentMethod);
      }

      if (filters.dueDateFrom) {
        queryParams.append("dueDateFrom", filters.dueDateFrom);
      }

      if (filters.dueDateTo) {
        queryParams.append("dueDateTo", filters.dueDateTo);
      }

      if (filters.minPendingAmount !== undefined) {
        queryParams.append(
          "minPendingAmount",
          filters.minPendingAmount.toString()
        );
      }

      if (filters.maxPendingAmount !== undefined) {
        queryParams.append(
          "maxPendingAmount",
          filters.maxPendingAmount.toString()
        );
      }

      const res = await fetch(
        `/api/reports/pendingFees?${queryParams.toString()}`
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error desconocido");
      }

      const data = await res.json();
      setAcademicYear(data.academicYear);
      setPendingFees(data.pendingFees);
    } catch (err: any) {
      setError(err.message || "Error al obtener el reporte.");
    } finally {
      setLoading(false);
    }
  };

  const showDrawer = () => {
    setIsDrawerVisible(true);
  };

  const onClose = () => {
    setIsDrawerVisible(false);
  };

  const handleGenerateReport = () => {
    const defaultAcademicYear = getCurrentAcademicYear();
    const filters = {
      academicYear: defaultAcademicYear,
    };
    fetchPendingFees(filters);
    message.success(
      `Reporte generado para el año académico ${defaultAcademicYear}-${
        defaultAcademicYear + 1
      }`
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
        <Button type="primary" icon={<FilterOutlined />} onClick={showDrawer}>
          Filtros
        </Button>

        <Button
          type="default"
          icon={<FileSearchOutlined />}
          onClick={handleGenerateReport}
        >
          Generar Reporte
        </Button>
      </div>

      <Drawer
        title="Filtros de Cuotas Pendientes"
        width={400}
        onClose={onClose}
        visible={isDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <PendingFeesForm
          onSubmit={(filters) => {
            fetchPendingFees(filters);
            onClose();
          }}
        />
      </Drawer>

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

      {pendingFees.length > 0 && academicYear && (
        <>
          <PendingFeesTable
            academicYear={academicYear}
            pendingFees={pendingFees}
          />
        </>
      )}

      {pendingFees.length === 0 && !loading && academicYear && (
        <Alert
          message="No hay cuotas pendientes"
          description={`No se encontraron cuotas pendientes para el año académico ${academicYear}.`}
          type="info"
          showIcon
          style={{ marginTop: "20px" }}
        />
      )}
    </div>
  );
};

export default PendingFeesReport;
