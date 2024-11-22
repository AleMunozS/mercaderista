"use client";

import React, { useEffect, useState } from "react";
import { Form, InputNumber, Select, Button, message, Spin } from "antd";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  PaymentFormValues,
  PaymentFormInputValues,
  FeesResponse,
  FeeExtended
} from "../../types/types";
import type { Parent, Student } from "@prisma/client";

const { Option } = Select;

interface PaymentFormProps {
  initialValues?: PaymentFormInputValues;
  paymentId?: number;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  initialValues,
  paymentId,
}) => {
  const [form] = Form.useForm<PaymentFormInputValues>();
  const router = useRouter();
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [fees, setFees] = useState<FeeExtended[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [loadingFees, setLoadingFees] = useState<boolean>(false);

  useEffect(() => {
    const fetchParents = async () => {
      try {
        const parentsResponse = await axios.get<{ data: Parent[] }>("/api/parents");
        setParents(parentsResponse.data.data);
      } catch (error) {
        message.error("Error al cargar los padres.");
        console.error(error);
      }
    };

    fetchParents();

    if (initialValues) {
      form.setFieldsValue(initialValues);
      // Si hay un padre inicial, cargar los estudiantes y cuotas correspondientes
      if (initialValues.parent_id) {
        fetchStudents(initialValues.parent_id);
      }
      if (initialValues.student_id) {
        fetchFees(initialValues.student_id);
      }
    }
  }, [initialValues, form]);

  const fetchStudents = async (parentId: number) => {
    setLoadingStudents(true);
    try {
      const studentsResponse = await axios.get<{ data: Student[] }>("/api/students", {
        params: { parent_id: parentId },
      });
      if (studentsResponse.data && Array.isArray(studentsResponse.data.data)) {
        setStudents(studentsResponse.data.data);
      } else {
        message.error("Formato inesperado de datos de estudiantes.");
        console.error("Respuesta de estudiantes:", studentsResponse.data);
      }
    } catch (error) {
      message.error("Error al cargar los estudiantes.");
      console.error(error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchFees = async (studentId: number) => {
    setLoadingFees(true);
    try {
      const feesResponse = await axios.get<FeesResponse>("/api/fees", {
        params: { student_id: studentId },
      });
      if (feesResponse.data && Array.isArray(feesResponse.data.data)) {
        setFees(feesResponse.data.data);
      } else {
        message.error("Formato inesperado de datos de cuotas.");
        console.error("Respuesta de cuotas:", feesResponse.data);
      }
    } catch (error) {
      message.error("Error al cargar las cuotas.");
      console.error(error);
    } finally {
      setLoadingFees(false);
    }
  };

  const handleParentChange = (value: number) => {
    form.setFieldsValue({ student_id: undefined, fee_id: undefined });
    setStudents([]);
    setFees([]);
    fetchStudents(value);
  };

  const handleStudentChange = (value: number) => {
    form.setFieldsValue({ fee_id: undefined });
    setFees([]);
    fetchFees(value);
  };

  const onFinish = async (values: PaymentFormInputValues) => {
    try {
      const formattedValues: PaymentFormValues = {
        ...values,
      };

      if (paymentId) {
        await axios.put(`/api/payments/${paymentId}`, formattedValues);
        message.success("Pago actualizado exitosamente.");
      } else {
        await axios.post("/api/payments", formattedValues);
        message.success("Pago creado exitosamente.");
      }
      router.push("/payments");
    } catch (error) {
      message.error("Error al guardar el pago.");
      console.error(error);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      {/* Selección del Padre */}
      <Form.Item
        label="Padre"
        name="parent_id"
        rules={[{ required: true, message: "Por favor selecciona el padre." }]}
      >
        <Select
          placeholder="Selecciona un padre"
          onChange={handleParentChange}
          allowClear
        >
          {parents.map((parent) => (
            <Option key={parent.parent_id} value={parent.parent_id}>
              {parent.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Selección del Alumno */}
      <Form.Item
        label="Alumno"
        name="student_id"
        rules={[{ required: true, message: "Por favor selecciona el alumno." }]}
      >
        <Select
          placeholder="Selecciona un alumno"
          onChange={handleStudentChange}
          disabled={!form.getFieldValue("parent_id")}
          notFoundContent={loadingStudents ? <Spin size="small" /> : null}
          allowClear
        >
          {students.map((student) => (
            <Option key={student.student_id} value={student.student_id}>
              {student.name} - {student.grade}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Selección de la Cuota */}
      <Form.Item
        label="Cuota"
        name="fee_id"
        rules={[{ required: true, message: "Por favor selecciona la cuota." }]}
      >
        <Select
          placeholder="Selecciona una cuota"
          disabled={!form.getFieldValue("student_id")}
          notFoundContent={loadingFees ? <Spin size="small" /> : null}
          allowClear
        >
          {fees.map((fee) => (
            <Option key={fee.fee_id} value={fee.fee_id}>
              {fee.description} - ${fee.amount.toFixed(2)} - Vencimiento:{" "}
              {new Date(fee.due_date).toLocaleDateString()}
              {fee.is_paid ? " (Pagada)" : ` (Restante: $${fee.remaining_amount.toFixed(2)})`}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Monto */}
      <Form.Item
        label="Monto"
        name="amount"
        rules={[{ required: true, message: "Por favor ingresa el monto." }]}
      >
        <InputNumber
          style={{ width: "100%" }}
          min={0}
          formatter={(value) => `$ ${value}`}
          parser={(value?: string) =>
            value ? parseFloat(value.replace(/\$\s?|(,*)/g, "")) : 0
          }
        />
      </Form.Item>

      {/* Estado */}
      <Form.Item
        label="Estado"
        name="status"
        rules={[{ required: true, message: "Por favor selecciona el estado." }]}
      >
        <Select placeholder="Selecciona el estado">
          <Option value="PENDING">Pendiente</Option>
          <Option value="COMPLETED">Completado</Option>
          <Option value="FAILED">Fallido</Option>
        </Select>
      </Form.Item>

      {/* Método de Pago */}
      <Form.Item
        label="Método de Pago"
        name="payment_method"
        rules={[
          {
            required: true,
            message: "Por favor selecciona el método de pago.",
          },
        ]}
      >
        <Select placeholder="Selecciona el método de pago">
          <Option value="CASH">Efectivo</Option>
          <Option value="CREDIT_CARD">Tarjeta de Crédito</Option>
          <Option value="DEBIT_CARD">Tarjeta de Débito</Option>
          <Option value="TRANSFER">Transferencia</Option>
        </Select>
      </Form.Item>

      {/* Botón de Envío */}
      <Form.Item>
        <Button type="primary" htmlType="submit">
          {paymentId ? "Actualizar" : "Crear"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PaymentForm;
