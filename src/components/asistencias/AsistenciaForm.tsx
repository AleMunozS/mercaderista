"use client";

import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Select, DatePicker } from "antd";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AsistenciaFormInputValues, Usuario, Local } from "@/types/types";
import dayjs from "dayjs";

const { Option } = Select;

interface AsistenciaFormProps {
  initialValues?: AsistenciaFormInputValues;
  asistenciaId?: number;
}

const AsistenciaForm: React.FC<AsistenciaFormProps> = ({
  initialValues,
  asistenciaId,
}) => {
  const [form] = Form.useForm<AsistenciaFormInputValues>();
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [locales, setLocales] = useState<Local[]>([]);

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
      form.setFieldsValue({
        ...initialValues,
        checkInTime: initialValues.checkInTime
          ? dayjs(initialValues.checkInTime)
          : null,
        checkOutTime: initialValues.checkOutTime
          ? dayjs(initialValues.checkOutTime)
          : null,
      });
    }
  }, [initialValues, form]);

  const onFinish = async (values: AsistenciaFormInputValues) => {
    try {
      const payload = {
        ...values,
        checkInTime: values.checkInTime
          ? values.checkInTime.toISOString()
          : null,
        checkOutTime: values.checkOutTime
          ? values.checkOutTime.toISOString()
          : null,
      };

      if (asistenciaId) {
        await axios.put(`/api/asistencia/${asistenciaId}`, payload);
        message.success("Asistencia actualizada exitosamente.");
      } else {
        await axios.post("/api/asistencia", payload);
        message.success("Asistencia creada exitosamente.");
      }
      router.push("/asistencias");
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const response = error.response?.data as { error?: string };
        if (response?.error) {
          message.error(response.error);
        } else {
          message.error("Error al guardar la asistencia.");
        }
      } else {
        message.error("Error al guardar la asistencia.");
      }
      console.error(error);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
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

      <Form.Item
        label="Fecha y Hora de Check-In"
        name="checkInTime"
        rules={[
          { required: true, message: "Por favor ingresa la fecha y hora de Check-In." },
        ]}
      >
        <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
      </Form.Item>

      <Form.Item
        label="Geolocalización de Check-In"
        name="checkInGeoLocation"
        rules={[
          { required: true, message: "Por favor ingresa la geolocalización de Check-In." },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Fecha y Hora de Check-Out"
        name="checkOutTime"
      >
        <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
      </Form.Item>

      <Form.Item
        label="Geolocalización de Check-Out"
        name="checkOutGeoLocation"
      >
        <Input />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {asistenciaId ? "Actualizar" : "Crear"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AsistenciaForm;
