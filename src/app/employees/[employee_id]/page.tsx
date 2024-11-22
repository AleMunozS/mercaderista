'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Spin, message, Button } from 'antd';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import EmployeeForm from '@/components/employees/EmployeeForm';
import { EmployeeExtended, EmployeeFormInputValues } from '@/types/types';
import dayjs from 'dayjs';

const { Title } = Typography;

const EditEmployeePage: React.FC = () => {
  const params = useParams();
  const employee_id = params?.employee_id;
  const [employee, setEmployee] = useState<EmployeeExtended | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/employees/${employee_id}`);
      setEmployee(response.data);
    } catch (error) {
      message.error('Error al obtener los datos del empleado.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employee_id) {
      fetchEmployee();
    }
  }, [employee_id]);

  if (loading) {
    return <Spin />;
  }

  if (!employee) {
    return <div>No se encontró el empleado.</div>;
  }

  const initialFormValues: EmployeeFormInputValues = {
    name: employee.name,
    email: employee.email,
    phone: employee.phone,
    position: employee.position,
    salary: employee.salary,
    start_date: dayjs(employee.start_date),
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Editar Empleado</Title>
      <EmployeeForm initialValues={initialFormValues} employeeId={employee.employee_id} />
      <Link href="/employees">
        <Button style={{ marginTop: '20px' }}>Volver a la Lista</Button>
      </Link>
    </div>
  );
};

export default EditEmployeePage;
