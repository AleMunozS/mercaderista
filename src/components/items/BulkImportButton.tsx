// components/items/BulkImportButton.tsx

"use client";

import React, { useState } from "react";
import { Button, Upload, message, Modal } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import axios from "axios";

const BulkImportButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<
    Array<{ nombre: string; itemCode: string }> | null
  >(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Función para procesar el archivo Excel
  const handleFile = (file: File) => {
    console.log("Archivo seleccionado:", file);
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;
      console.log("Datos leídos del archivo:", data);

      // Usar readAsArrayBuffer en lugar de readAsBinaryString
      // y ajustar la lógica de verificación
      if (!(data instanceof ArrayBuffer)) {
        message.error("No se pudo leer el archivo. Tipo de dato incorrecto.");
        console.error("Tipo de dato recibido:", typeof data, data);
        return;
      }

      try {
        const workbook = XLSX.read(data, { type: "array" });
        console.log("Workbook leído:", workbook);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: Array<any> = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log("Datos JSON convertidos:", jsonData);

        if (!Array.isArray(jsonData) || jsonData.length < 2) {
          message.error("El archivo debe contener al menos una fila de encabezados y datos.");
          return;
        }

        // Definir explícitamente el tipo de headers como string[]
        const headers = jsonData[0] as string[];
        console.log("Encabezados encontrados:", headers);
        const rows = jsonData.slice(1);

        // Validar que los encabezados requeridos existan
        if (!headers.includes("nombre") || !headers.includes("itemCode")) {
          message.error("El archivo debe contener las columnas 'nombre' e 'itemCode'.");
          console.error("Encabezados faltantes: 'nombre' o 'itemCode'");
          return;
        }

        const items: Array<{ nombre: string; itemCode: string }> = [];

        rows.forEach((row, index) => {
          const rowArray = row as any[]; // Aseguramos que sea un array
          const nombre = rowArray[headers.indexOf("nombre")]?.toString().trim();
          const itemCode = rowArray[headers.indexOf("itemCode")]?.toString().trim();

          if (nombre && itemCode) {
            items.push({ nombre, itemCode });
          } else {
            message.warning(`Fila ${index + 2} incompleta y será omitida.`);
            console.warn(`Fila ${index + 2} incompleta:`, row);
          }
        });

        console.log("Ítems procesados:", items);

        if (items.length === 0) {
          message.error("No se encontraron ítems válidos en el archivo.");
          return;
        }

        setPreviewData(items);
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

    // Usar readAsArrayBuffer
    reader.readAsArrayBuffer(file);
    return false; // Evita que el componente Upload cargue automáticamente el archivo
  };

  // Función para enviar los datos al API de importación masiva
  const handleUpload = async () => {
    if (!previewData) return;

    setLoading(true);
    try {
      console.log("Enviando datos al API:", previewData);
      const response = await axios.post("/api/items/bulk_import", previewData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Respuesta del API:", response);
      if (response.status === 201) {
        message.success(`Importación exitosa. Ítems importados: ${response.data.count}`);
        // Opcional: Refrescar la lista de ítems si ItemList soporta revalidación
      } else {
        message.error("Hubo un problema al importar los ítems.");
      }
    } catch (error: any) {
      console.error("Error al importar los ítems:", error);
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
          Importar desde Excel
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
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>Item Code</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((item, index) => (
                  <tr key={index}>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{index + 1}</td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{item.nombre}</td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{item.itemCode}</td>
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
