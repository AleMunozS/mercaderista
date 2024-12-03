"use client";

import React, { useState } from "react";
import { Button, Upload, message, Modal } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import axios from "axios";

const BulkImportButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<
    Array<{ nombre: string; direccion?: string; supermercado?: string }> | null
  >(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Función para procesar el archivo Excel
  const handleFile = (file: File) => {
    console.log("Archivo seleccionado:", file);
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;

      if (!(data instanceof ArrayBuffer)) {
        message.error("No se pudo leer el archivo. Tipo de dato incorrecto.");
        return;
      }

      try {
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: Array<any> = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!Array.isArray(jsonData) || jsonData.length < 2) {
          message.error("El archivo debe contener al menos una fila de encabezados y datos.");
          return;
        }

        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1);

        // Definir los campos requeridos y opcionales
        const requiredHeaders = ["nombre"];
        const optionalHeaders = ["direccion", "supermercado"];
        const allAllowedHeaders = [...requiredHeaders, ...optionalHeaders];

        // Validar que los encabezados requeridos existan
        const missingRequired = requiredHeaders.filter(header => !headers.includes(header));
        if (missingRequired.length > 0) {
          message.error(`El archivo debe contener la(s) columna(s) '${missingRequired.join(", ")}'.`);
          return;
        }

        const locales: Array<{ nombre: string; direccion?: string; supermercado?: string }> = [];

        rows.forEach((row, index) => {
          const rowArray = row as any[];
          const nombre = rowArray[headers.indexOf("nombre")]?.toString().trim();
          const direccion = headers.includes("direccion") ? rowArray[headers.indexOf("direccion")]?.toString().trim() : undefined;
          const supermercado = headers.includes("supermercado") ? rowArray[headers.indexOf("supermercado")]?.toString().trim() : undefined;

          if (nombre) {
            locales.push({ nombre, direccion, supermercado });
          } else {
            message.warning(`Fila ${index + 2} incompleta y será omitida.`);
          }
        });

        if (locales.length === 0) {
          message.error("No se encontraron locales válidos en el archivo.");
          return;
        }

        setPreviewData(locales);
        setIsModalVisible(true);
      } catch (error) {
        console.error("Error al procesar el archivo Excel:", error);
        message.error("Error al procesar el archivo Excel.");
      }
    };

    reader.onerror = (error) => {
      console.error("Error al leer el archivo:", error);
      message.error("Error al leer el archivo.");
    };

    reader.readAsArrayBuffer(file);
    return false; // Evita que el componente Upload cargue automáticamente el archivo
  };

  // Función para enviar los datos al API de importación masiva
  const handleUpload = async () => {
    if (!previewData) return;

    setLoading(true);
    try {
      const response = await axios.post("/api/locales/bulk_import", previewData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        message.success(`Importación exitosa. Locales importados: ${response.data.count}`);
      } else {
        message.error("Hubo un problema al importar los locales.");
      }
    } catch (error: any) {
      console.error("Error al importar los locales:", error);
      message.error(error.response?.data?.error || "Error al realizar la importación masiva.");
    } finally {
      setLoading(false);
      setIsModalVisible(false);
      setPreviewData(null);
    }
  };

  return (
    <>
      <Upload beforeUpload={handleFile} accept=".xlsx, .xls" showUploadList={false}>
        <Button icon={<UploadOutlined />} type="default" style={{ marginLeft: "10px" }}>
          Importar Locales desde Excel
        </Button>
      </Upload>

      <Modal
        title="Vista Previa de la Importación"
        visible={isModalVisible}
        onOk={handleUpload}
        onCancel={() => setIsModalVisible(false)}
        okText="Importar"
        cancelText="Cancelar"
        confirmLoading={loading}
        width={800}
      >
        {previewData && (
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>#</th>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>Nombre</th>
                  {previewData.some(local => local.direccion) && (
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>Dirección</th>
                  )}
                  {previewData.some(local => local.supermercado) && (
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>Supermercado</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {previewData.map((local, index) => (
                  <tr key={index}>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{index + 1}</td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{local.nombre}</td>
                    {local.direccion && (
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{local.direccion}</td>
                    )}
                    {local.supermercado && (
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>{local.supermercado}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </>
  );
};

export default BulkImportButton;
