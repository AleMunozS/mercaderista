"use client";

import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  message,
  Select,
  DatePicker,
  List,
  Card,
  InputNumber,
  Space,
  Upload,
} from "antd";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  VoucherFormInputValues,
  Usuario,
  Local,
  Item,
  Foto,
} from "@/types/types";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;

interface VoucherFormProps {
  initialValues?: VoucherFormInputValues;
  voucherId?: number;
}

const VoucherForm: React.FC<VoucherFormProps> = ({
  initialValues,
  voucherId,
}) => {
  const [form] = Form.useForm<VoucherFormInputValues>();
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [locales, setLocales] = useState<Local[]>([]);
  const [items, setItems] = useState<Item[]>(initialValues?.items || []);
  const [fotos, setFotos] = useState<Foto[]>(initialValues?.fotos || []);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get("/api/usuarios");
        setUsuarios(response.data);
      } catch (error) {
        message.error("Error al cargar los usuarios.");
      }
    };

    const fetchLocales = async () => {
      try {
        const response = await axios.get("/api/locales");
        setLocales(response.data);
      } catch (error) {
        message.error("Error al cargar los locales.");
      }
    };

    fetchUsuarios();
    fetchLocales();
  }, []);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setItems(initialValues.items || []);
      setFotos(initialValues.fotos || []);
    }
  }, [initialValues, form]);

  const onFinish = async (values: VoucherFormInputValues) => {
    try {
      const payload = {
        ...values,
        items,
        fotos,
      };

      if (voucherId) {
        await axios.put(`/api/vouchers/${voucherId}`, payload);
        message.success("Voucher actualizado exitosamente.");
      } else {
        await axios.post("/api/vouchers", payload);
        message.success("Voucher creado exitosamente.");
      }
      router.push("/vouchers");
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const response = error.response?.data as { error?: string };
        if (response?.error) {
          message.error(response.error);
        } else {
          message.error("Error al guardar el voucher.");
        }
      } else {
        message.error("Error al guardar el voucher.");
      }
      console.error(error);
    }
  };

  const addItem = () => {
    const item = form.getFieldsValue(["itemNombre", "itemCantidad", "itemPrecio"]);
    if (!item.itemNombre || !item.itemCantidad) {
      message.error("Debes completar el nombre y la cantidad del item.");
      return;
    }
    setItems([
      ...items,
      {
        id: Date.now(),
        nombre: item.itemNombre,
        cantidad: item.itemCantidad,
        precio: item.itemPrecio,
        voucherId: voucherId || 0,
      },
    ]);
    form.resetFields(["itemNombre", "itemCantidad", "itemPrecio"]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpload = (info: any) => {
    if (info.file.status === "done") {
      // Supongamos que el backend devuelve la URL de la foto
      const fotoUrl = info.file.response.url;
      setFotos([
        ...fotos,
        {
          id: Date.now(),
          url: fotoUrl,
          voucherId: voucherId || 0,
        },
      ]);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Tipo"
        name="tipo"
        rules={[{ required: true, message: "Por favor selecciona el tipo." }]}
      >
        <Select placeholder="Selecciona un tipo">
          <Option value="inventario">Inventario</Option>
          <Option value="merma">Merma</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Usuario"
        name="usuarioId"
        rules={[{ required: true, message: "Por favor selecciona un usuario." }]}
      >
        <Select placeholder="Selecciona un usuario">
          {usuarios.map((usuario) => (
            <Option key={usuario.id} value={usuario.id}>
              {usuario.nombre}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Local"
        name="localId"
        rules={[{ required: true, message: "Por favor selecciona un local." }]}
      >
        <Select placeholder="Selecciona un local">
          {locales.map((local) => (
            <Option key={local.id} value={local.id}>
              {local.nombre}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Sección para agregar items */}
      <Card title="Items">
        <Space direction="vertical" style={{ width: "100%" }}>
          <Space>
            <Form.Item name="itemNombre">
              <Input placeholder="Nombre del Item" />
            </Form.Item>
            <Form.Item name="itemCantidad">
              <InputNumber placeholder="Cantidad" min={1} />
            </Form.Item>
            <Form.Item name="itemPrecio">
              <InputNumber placeholder="Precio" min={0} step={0.01} />
            </Form.Item>
            <Button type="primary" onClick={addItem}>
              Agregar Item
            </Button>
          </Space>
          <List
  dataSource={items}
  renderItem={(item) => (
    <List.Item
      key={item.id} // Añadimos la clave única
      actions={[
        <Button danger onClick={() => removeItem(item.id)} key={`remove-${item.id}`}>
          Eliminar
        </Button>,
      ]}
    >
      {item.nombre} - Cantidad: {item.cantidad} - Precio:{" "}
      {item.precio || "N/A"}
    </List.Item>
  )}
/>

        </Space>
      </Card>

      {/* Sección para subir fotos */}
      <Form.Item label="Fotos">
        <Upload
          action="/api/upload" // Endpoint para subir fotos
          listType="picture"
          onChange={handleUpload}
        >
          <Button icon={<UploadOutlined />}>Subir Foto</Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {voucherId ? "Actualizar" : "Crear"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default VoucherForm;
