"use client";

import React from "react";
import { Card, Table, Row, Col, Typography, Layout, Space } from "antd";

const { Title } = Typography;
const { Content } = Layout;

const dataSource = [
  {
    key: "1",
    student: "Lonus",
    grade: "10",
    feesDue: "$500",
    parentContact: "papas.lonus@example.com",
  },
  {
    key: "2",
    student: "MaikiH",
    grade: "9",
    feesDue: "$300",
    parentContact: "papas.maiki@example.com",
  },
  {
    key: "3",
    student: "Alejandro Flutter",
    grade: "11",
    feesDue: "$0",
    parentContact: "alejandro.flutter@example.com",
  },
];

const columns = [
  {
    title: <span style={{ color: "black" }}>Nombre del Estudiante</span>,
    dataIndex: "student",
    key: "student",
  },
  {
    title: <span style={{ color: "black" }}>Grado</span>,
    dataIndex: "grade",
    key: "grade",
  },
  {
    title: <span style={{ color: "black" }}>Cuotas Pendientes</span>,
    dataIndex: "feesDue",
    key: "feesDue",
    render: (text: string) => <span style={{ color: "black" }}>{text}</span>,
  },
  {
    title: <span style={{ color: "black" }}>Contacto de Padres</span>,
    dataIndex: "parentContact",
    key: "parentContact",
  },
];

const HomePage: React.FC = () => {
  return (
    <Layout>
      <Content style={{ padding: "20px" }}>
        {/* <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Card>
                <Title level={4}>Total de Cuotas Recaudadas</Title>
                <Title level={2} style={{ color: "#1890ff" }}>
                  $120,000
                </Title>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Title level={4}>Cuotas Pendientes</Title>
                <Title level={2} style={{ color: "#ff4d4f" }}>
                  $15,000
                </Title>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Title level={4}>Total de Estudiantes</Title>
                <Title level={2} style={{ color: "#1890ff" }}>
                  1,200
                </Title>
              </Card>
            </Col>
          </Row>

          <Card title="Detalles de Cuotas de Estudiantes">
            <Table
              dataSource={dataSource}
              columns={columns}
              pagination={false}
            />
          </Card>
        </Space> */}
      </Content>
    </Layout>
  );
};

export default HomePage;
