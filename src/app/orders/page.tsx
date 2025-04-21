'use client'

import { Table, Space, Button, Tooltip, Tag, Skeleton } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import {
  PlusOutlined,
  ImportOutlined,
  ExportOutlined,
  AppstoreOutlined,
  ReloadOutlined,
  EditOutlined,
  EyeOutlined,
  SwapOutlined,
  CarOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface Order {
  id: number
  order_nbr: string
  order_type: string
  status: number
  priority: number
  hold_flag: 'Y' | 'N'
  consignee_id: number
  currency_code: string
  order_value: number
  transport_mode: string
  service_level: string
  ship_window_from: string
  ship_window_to: string
  deliv_window_to: string
  create_date: string
  line_count: number
  total_qty: number
}

const columns: ColumnsType<Order> = [
  {
    title: 'Order #',
    dataIndex: 'order_nbr',
    width: 120,
    fixed: 'left',
    render: (_, record) => <a href={`/orders/${record.id}`}>{record.order_nbr}</a>,
  },
  {
    title: 'Type',
    dataIndex: 'order_type',
    width: 60,
    align: 'center',
    render: (t) => <Tag>{t}</Tag>,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    width: 80,
    align: 'center',
    render: (s) => <Tag color={s === 10 ? 'green' : 'blue'}>{s}</Tag>,
  },
  {
    title: 'Priority',
    dataIndex: 'priority',
    width: 80,
    align: 'center',
  },
  {
    title: 'Delivery',
    dataIndex: 'deliv_window_to',
    width: 90,
    render: (d) => (d ? d.split('T')[0] : '—'),
  },
  {
    title: 'Value',
    dataIndex: 'order_value',
    width: 80,
    align: 'right',
    render: (v: number | string) => {
      const num = typeof v === 'number' ? v : parseFloat(v) || 0
      return `$ ${num.toFixed(2)}`
    },
  },
  {
    title: 'Mode',
    dataIndex: 'transport_mode',
    width: 60,
    align: 'center',
    render: (m) => (m === 'TRK' ? '🚚' : m === 'AIR' ? '✈️' : m === 'SEA' ? '🛳️' : m),
  },
  {
    title: 'Service',
    dataIndex: 'service_level',
    width: 100,
  },
  {
    title: 'Lines',
    dataIndex: 'line_count',
    width: 50,
    align: 'center',
  },
  {
    title: 'Qty',
    dataIndex: 'total_qty',
    width: 50,
    align: 'right',
  },
  {
    title: 'Created',
    dataIndex: 'create_date',
    width: 120,
    render: (d) => d.replace('T', ' ').slice(0, 16),
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 220,
    align: 'center',
    render: (_text, record) => (
      <Space>
        <Tooltip title="Edit (live)">
          <Button shape="circle" icon={<EditOutlined />} />
        </Tooltip>
        <Tooltip title="View">
          <Button shape="circle" icon={<EyeOutlined />} />
        </Tooltip>
        <Tooltip title="Allocate (Coming soon)">
          <Button shape="circle" icon={<SwapOutlined />} disabled />
        </Tooltip>
        <Tooltip title="Release (Coming soon)">
          <Button shape="circle" icon={<CarOutlined />} disabled />
        </Tooltip>
        <Tooltip title="Cancel (Coming soon)">
          <Button shape="circle" icon={<CloseOutlined />} disabled />
        </Tooltip>
      </Space>
    ),
  },
]

export default function OrderGridPage() {
  // Este es un componente cliente, 'use client' al inicio garantiza router disponible
  const router = useRouter()
  const [data, setData] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<{
    current: number
    pageSize: number
    total: number
  }>({
    current: 1,
    pageSize: 50,
    total: 0,
  })

  const fetchData = useCallback(
    async (page = 1, pageSize = 50) => {
      setLoading(true)
      const { data: res } = await axios.get<{ rows: Order[]; total: number }>(
        '/api/orders',
        { params: { page, pageSize } }
      )
      setData(res.rows)
      setPagination({ current: page, pageSize, total: res.total })
      setLoading(false)
    },
    []
  )

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize)
  }, [fetchData, pagination.current, pagination.pageSize])

  const handleTableChange = (pag: TablePaginationConfig) => {
    const current = pag.current || 1
    const pageSize = pag.pageSize || 50
    fetchData(current, pageSize)
  }

  return (
    <>
      <Space style={{ marginBottom: 16, marginTop: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push('/orders/create')}
        >
          Nuevo pedido
        </Button>
        <Button icon={<ImportOutlined />} disabled>
          Import CSV
        </Button>
        <Button icon={<ExportOutlined />} disabled>
          Export CSV
        </Button>
        <Button icon={<AppstoreOutlined />}>Bulk Allocate</Button>
        <Button icon={<AppstoreOutlined />}>Print Docs</Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => fetchData(1, pagination.pageSize)}
        >
          Refresh
        </Button>
      </Space>

      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <Table<Order>
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
        />
      )}
    </>
  )
}