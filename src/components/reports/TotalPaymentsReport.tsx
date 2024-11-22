// app/reports/totalPayments/TotalPaymentsReport.tsx
'use client';

import React, { useState } from 'react';
import { Spin, Alert } from 'antd';
import PaymentReportForm, { ReportFilters } from './PaymentReportForm';
import PaymentReportResult from './PaymentReportResult';

const TotalPaymentsReport: React.FC = () => {
  const [filters, setFilters] = useState<ReportFilters | null>(null);
  const [totalPayments, setTotalPayments] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTotalPayments = async (filters: ReportFilters) => {
    setLoading(true);
    setError(null);
    setTotalPayments(null);
    setFilters(filters);

    try {
      const queryParams = new URLSearchParams();

      queryParams.append('academicYear', filters.academicYear.toString());

      if (filters.paymentMethod) {
        queryParams.append('paymentMethod', filters.paymentMethod);
      }

      if (filters.paymentStatus) {
        queryParams.append('paymentStatus', filters.paymentStatus);
      }

      if (filters.grade) {
        queryParams.append('grade', filters.grade);
      }

      const res = await fetch(`/api/reports/totalPayments?${queryParams.toString()}`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error desconocido');
      }

      const data = await res.json();
      setTotalPayments(data.totalPayments);
    } catch (err: any) {
      setError(err.message || 'Error al obtener el reporte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <PaymentReportForm onSubmit={fetchTotalPayments} />

      {loading && <Spin tip="Cargando..." />}

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginTop: '20px' }}
        />
      )}

      {totalPayments !== null && filters && (
       <PaymentReportResult
       academicYear={`${Number(filters.academicYear)}-${Number(filters.academicYear) + 1}`}
       totalPayments={totalPayments}
       filters={filters}
     />
      )}
    </div>
  );
};

export default TotalPaymentsReport;
