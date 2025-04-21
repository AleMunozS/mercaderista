// src/app/dashboard/page.tsx (dashboard simple con Ant Design Statistic)

"use client";

import React from "react";
import { Row, Col, Card, Statistic } from "antd";

const DashboardPage: React.FC = () => {
  // Datos de ejemplo
  const summary = {
    users: 123,
    orders: 45,
  };

  return (
    <div style={{ padding: 20 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Usuarios" value={summary.users} />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="OM Orders" value={summary.orders} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
