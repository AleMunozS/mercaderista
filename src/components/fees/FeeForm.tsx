//src\components\fees\FeeForm.tsx

"use client";

import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Select,
  message,
} from "antd";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import { FeeFormInputValues, FeeFormValues } from "../../types/types";
import dayjs from "dayjs";
import type { Student } from "@prisma/client";

interface FeeFormProps {
  initialValues?: FeeFormInputValues;
  feeId?: number;
}

const FeeForm: React.FC<FeeFormProps> = ({ initialValues, feeId }) => {
  const [form] = Form.useForm<FeeFormInputValues>();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get("/api/students");
        setStudents(response.data.data);
      } catch (error) {
        message.error("Error al cargar los estudiantes.");
        console.error(error);
      }
    };
    fetchStudents();

    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        due_date: initialValues.due_date ? dayjs(initialValues.due_date) : null,
      });
    }
  }, [initialValues, form]);

  const onFinish = async (values: FeeFormInputValues) => {
    try {
      const formattedValues: FeeFormValues = {
        ...values,
        due_date: values.due_date
          ? values.due_date.toISOString()
          : new Date().toISOString(),
      };

      if (feeId) {
        await axios.put(`/api/fees/${feeId}`, formattedValues);
        message.success("Cuota actualizada exitosamente.");
      } else {
        await axios.post("/api/fees", formattedValues);
        message.success("Cuota creada exitosamente.");
      }
      router.push("/fees");
    } catch (error) {
      message.error("Error al guardar la cuota.");
      console.error(error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <Form.Item
        label="Descripción"
        name="description"
        rules={[
          { required: true, message: "Por favor ingresa la descripción." },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Monto"
        name="amount"
        rules={[{ required: true, message: "Por favor ingresa el monto." }]}
      >
        <InputNumber
          style={{ width: "100%" }}
          min={0}
          formatter={(value) => `$ ${value}`}
          parser={(value?: string) => {
            if (value) {
              const parsedValue = parseFloat(value.replace(/\$\s?|(,*)/g, ""));
              return isNaN(parsedValue) ? 0 : parsedValue;
            }
            return 0;
          }}
        />
      </Form.Item>

      <Form.Item
        label="Fecha de Vencimiento"
        name="due_date"
        rules={[
          {
            required: true,
            message: "Por favor selecciona la fecha de vencimiento.",
          },
        ]}
      >
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        label="Estudiante"
        name="student_id"
        rules={[
          { required: true, message: "Por favor selecciona el estudiante." },
        ]}
      >
        <Select placeholder="Selecciona un estudiante">
          {students.map((student) => (
            <Select.Option key={student.student_id} value={student.student_id}>
              {student.name} {/* Muestra el nombre del estudiante */}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {feeId ? "Actualizar" : "Crear"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default FeeForm;
