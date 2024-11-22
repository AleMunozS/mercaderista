// app/reports/totalPayments/components/PaymentReportResult.tsx
'use client';

import { Card, Typography } from 'antd';
import { ReportFilters } from './PaymentReportForm';

const { Title, Text } = Typography;

interface PaymentReportResultProps {
  academicYear: string;
  totalPayments: number;
  filters?: ReportFilters;
}

const PaymentReportResult: React.FC<PaymentReportResultProps> = ({
  academicYear,
  totalPayments,
  filters,
}) => {
  return (
    <Card>
      <Title level={4}>Reporte de Pagos</Title>
      <Text strong>Año Académico:</Text> <Text>{academicYear}</Text>
      <br />

      {filters?.paymentMethod && (
        <>
          <Text strong>Método de Pago:</Text> <Text>{filters.paymentMethod}</Text>
          <br />
        </>
      )}

      {filters?.paymentStatus && (
        <>
          <Text strong>Estado del Pago:</Text> <Text>{filters.paymentStatus}</Text>
          <br />
        </>
      )}

      {filters?.grade && (
        <>
          <Text strong>Grado:</Text> <Text>{filters.grade}</Text>
          <br />
        </>
      )}

      <Text strong>Total de Pagos Recibidos:</Text>{' '}
      <Text>${totalPayments.toFixed(2)}</Text>
    </Card>
  );
};

export default PaymentReportResult;
