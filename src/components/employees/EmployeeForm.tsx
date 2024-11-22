"use client";

import React, { useEffect } from "react";
import { Form, Input, Select, Button, DatePicker, message } from "antd";
import { useRouter } from "next/navigation";
import axios from "axios";
import { EmployeeFormInputValues, EmployeeFormValues } from "@/types/types";
import dayjs from "dayjs";

const { Option } = Select;

interface EmployeeFormProps {
  initialValues?: EmployeeFormInputValues;
  employeeId?: number;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialValues,
  employeeId,
}) => {
  const [form] = Form.useForm<EmployeeFormInputValues>();
  const router = useRouter();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        start_date: initialValues.start_date
          ? dayjs(initialValues.start_date)
          : null,
      });
    }
  }, [initialValues, form]);

  const onFinish = async (values: EmployeeFormInputValues) => {
    try {
      const payload: EmployeeFormValues = {
        ...values,
        start_date: values.start_date
          ? values.start_date.format("YYYY-MM-DD")
          : "",
      };

      if (employeeId) {
        await axios.put(`/api/employees/${employeeId}`, payload);
        message.success("Empleado actualizado exitosamente.");
      } else {
        await axios.post("/api/employees", payload);
        message.success("Empleado creado exitosamente.");
      }
      router.push("/employees");
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const response = error.response?.data as { error?: string };
        if (response?.error) {
          message.error(response.error);
        } else {
          message.error("Error al guardar el empleado.");
        }
      } else {
        message.error("Error al guardar el empleado.");
      }
      console.error(error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        position: "Profesor",
      }}
    >
      <Form.Item
        label="Nombre"
        name="name"
        rules={[{ required: true, message: "Por favor ingresa el nombre." }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Correo Electrónico"
        name="email"
        rules={[
          {
            required: true,
            message: "Por favor ingresa el correo electrónico.",
          },
          { type: "email", message: "Correo electrónico inválido." },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Teléfono"
        name="phone"
        rules={[{ required: true, message: "Por favor ingresa el teléfono." }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Posición"
        name="position"
        rules={[
          { required: true, message: "Por favor selecciona la posición." },
        ]}
      >
        <Select placeholder="Selecciona una posición">
          <Option value="Gerente">Gerente</Option>
          <Option value="Profesor">Profesor</Option>
          <Option value="Asistente">Asistente</Option>
          <Option value="Administrativo">Administrativo</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Salario"
        name="salary"
        rules={[{ required: true, message: "Por favor ingresa el salario." }]}
      >
        <Input type="number" min="0" step="0.01" />
      </Form.Item>

      <Form.Item
        label="Fecha de Inicio"
        name="start_date"
        rules={[
          {
            required: true,
            message: "Por favor selecciona la fecha de inicio.",
          },
        ]}
      >
        <DatePicker format="YYYY-MM-DD" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {employeeId ? "Actualizar" : "Crear"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EmployeeForm;
