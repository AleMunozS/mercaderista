// src/components/dashboard/SummaryCard.tsx

"use client";

import React from "react";
import { Card, Typography } from "antd";
import { ReactNode } from "react";
import styled from "styled-components";

const { Title, Text } = Typography;

// Styled-components para personalizar el diseño
const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  &:hover {
    transform: translateY(-5px);
  }
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1px;
`;

const IconContainer = styled.div<{ color: string }>`
  background: ${(props) => props.color};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 20px;
  margin-bottom: 12px;
  /* Asegurar que el icono esté centrado */
  margin-left: auto;
  margin-right: auto;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

interface SummaryCardProps {
  title: string;
  value: number;
  description?: string;
  icon: ReactNode;
  color: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  description,
  icon,
  color,
}) => {
  return (
    <StyledCard>
      <IconContainer color={color}>{icon}</IconContainer>
      <ContentContainer>
        <Title level={5} style={{ margin: 0, color: "#555" }}>
          {title}
        </Title>
        <Title level={3} style={{ margin: 0, color }}>
          {value}
        </Title>
        {description && <Text type="secondary">{description}</Text>}
      </ContentContainer>
    </StyledCard>
  );
};

export default SummaryCard;
