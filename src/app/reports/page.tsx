// app/reports/totalPayments/page.tsx
"use client";

import { Typography, Divider } from "antd";
import TotalPaymentsReport from "@/components/reports/TotalPaymentsReport";
import PaymentStatusReport from "@/components/reports/PaymentStatusReport";
import BalanceGeneralReport from "@/components/reports/BalanceGeneralReport";
import OutstandingPaymentsReport from "@/components/reports/OutstandingPaymentsReport";
import PendingFeesReport from "@/components/reports/PendingFeesReport";

const { Title } = Typography;

const TotalPaymentsPage: React.FC = () => {
  return (
    <div style={{ padding: "40px" }}>
      {/* Reporte de Total de Pagos */}
      <Title level={2}>Reporte: Total de Pagos Recibidos</Title>
      <TotalPaymentsReport />

      <Divider style={{ margin: "40px 0" }} />
      <Title level={2}>Reporte: Balance General</Title>
      <BalanceGeneralReport />

      <Divider style={{ margin: "40px 0" }} />

      <Title level={2}>Reporte: Pagos Pendientes</Title>
      <OutstandingPaymentsReport />

      <Divider style={{ margin: "40px 0" }} />

      <Title level={2}>Reporte: Cuotas Pendientes</Title>
      <PendingFeesReport />

      <Divider style={{ margin: "40px 0" }} />

      {/* Reporte de Estado de Pagos */}
      <Title level={2}>Reporte: Estado de Pagos</Title>
      <PaymentStatusReport />
    </div>
  );
};

export default TotalPaymentsPage;
