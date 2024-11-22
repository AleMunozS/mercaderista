// app/reports/balanceGeneral/components/BalanceResult.tsx
"use client";

import { Card, Typography } from "antd";

const { Title, Text } = Typography;

interface BalanceResultProps {
  academicYear: string;
  totalIngresos: number;
  totalGastos: number;
  balanceNeto: number;
}

const BalanceResult: React.FC<BalanceResultProps> = ({
  academicYear,
  totalIngresos,
  totalGastos,
  balanceNeto,
}) => {
  return (
    <Card>
      <Title level={4}>Balance General</Title>
      <Text strong>Año Académico:</Text> <Text>{academicYear}</Text>
      <br />
      <Text strong>Total de Ingresos:</Text>{" "}
      <Text>${totalIngresos.toFixed(2)}</Text>
      <br />
      <Text strong>Total de Gastos:</Text>{" "}
      <Text>${totalGastos.toFixed(2)}</Text>
      <br />
      <Text strong>Balance Neto:</Text>{" "}
      <Text style={{ color: balanceNeto >= 0 ? "green" : "red" }}>
        ${balanceNeto.toFixed(2)}
      </Text>
    </Card>
  );
};

export default BalanceResult;
