// src/components/VoucherDetails.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, List, Typography, Image, Spin, message } from "antd";
import axios from "axios";
import { Voucher, VoucherLine, Foto } from "@/types/types";

const { Title, Text } = Typography;

interface VoucherDetailsProps {
  voucherId: number;
}

const VoucherDetails: React.FC<VoucherDetailsProps> = ({ voucherId }) => {
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        const response = await axios.get(`/api/vouchers/${voucherId}`);
        setVoucher(response.data);
      } catch (error: any) {
        message.error(
          error.response?.data?.error || "Error al obtener el voucher."
        );
        router.push("/vouchers"); // Redirigir si hay un error
      } finally {
        setLoading(false);
      }
    };

    fetchVoucher();
  }, [voucherId, router]);

  if (loading) {
    return <Spin tip="Cargando voucher..." />;
  }

  if (!voucher) {
    return <Text>No se encontró el voucher.</Text>;
  }

  return (
    <Card title={`Voucher ID: ${voucher.id}`} style={{ margin: "20px" }}>
      <Title level={4}>Tipo: {voucher.tipo}</Title>
      <Text>
        <strong>Usuario:</strong> {voucher.usuario.nombre} (
        {voucher.usuario.email})
      </Text>
      <br />
      <Text>
        <strong>Local:</strong> {voucher.local.nombre} - Dirección:{" "}
        {voucher.local.direccion}
      </Text>
      <br />
      <Text>
        <strong>Creado el:</strong> {new Date(voucher.createdAt).toLocaleString()}
      </Text>

      {/* Sección de Voucher Lines */}
      <Card type="inner" title="Voucher Lines" style={{ marginTop: "20px" }}>
        {voucher.voucherLines.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={voucher.voucherLines}
            renderItem={(line: VoucherLine) => (
              <List.Item>
                <List.Item.Meta
                  title={line.item.nombre}
                  description={`Cantidad: ${line.cantidad} - Precio: ${
                    line.precio !== undefined ? `$${line.precio}` : "N/A"
                  }`}
                />
              </List.Item>
            )}
          />
        ) : (
          <Text>No hay líneas de voucher asociadas.</Text>
        )}
      </Card>

      {/* Sección de Fotos */}
      <Card type="inner" title="Fotos" style={{ marginTop: "20px" }}>
        {voucher.fotos.length > 0 ? (
          <List
            grid={{ gutter: 16, column: 4 }}
            dataSource={voucher.fotos}
            renderItem={(foto: Foto) => (
              <List.Item>
                <Image src={foto.url} alt={`Foto ${foto.id}`} />
              </List.Item>
            )}
          />
        ) : (
          <Text>No hay fotos asociadas.</Text>
        )}
      </Card>
    </Card>
  );
};

export default VoucherDetails;
