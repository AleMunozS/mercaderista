// src/types/types.ts

import type { Dayjs } from "dayjs";
import { Fee, Student, Payment } from "@prisma/client";
import {
  Enrollment as PrismaEnrollment,
  Employee as PrismaEmployee,
} from "@prisma/client";
import dayjs from "dayjs";

export type PaymentFormValues = Omit<Payment, "payment_id" | "date"> & {
  student_id?: number;
};


export type EnrollmentFormValues = Omit<
  PrismaEnrollment,
  "enrollment_id" | "enrollment_date"
>;

export type PaymentFormInputValues = PaymentFormValues;

export interface FeeFormInputValues {
  description: string;
  amount: number;
  due_date: Dayjs | null;
  student_id: number;
}

export interface FeeFormValues {
  description: string;
  amount: number;
  due_date: string;
  student_id: number;
}

export interface FeeExtended extends Fee {
  student: Student & {
    parent: Parent;
  };
  payments: Payment[];
  total_paid: number;
  remaining_amount: number;
  is_paid: boolean;
}


export interface Parent {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface PaymentExtended extends Payment {
  parent: Parent;
  fee: Fee;
}

export interface EnrollmentExtended extends PrismaEnrollment {
  student: Student & {
    parent: Parent;
  };
}

export interface EmployeeExtended extends PrismaEmployee {
  _futureExtension?: Record<string, unknown>;
}

export interface EmployeeFormInputValues {
  name: string;
  email: string;
  phone: string;
  position: string;
  salary: number;
  start_date: dayjs.Dayjs | null;
}

export interface EmployeeFormValues {
  name: string;
  email: string;
  phone: string;
  position: string;
  salary: number;
  start_date: string;
}

export interface FeesResponse {
  data: FeeExtended[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
