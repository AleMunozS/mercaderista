'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Button,
  Space,
  Card,
  Divider,
  message,
} from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import axios from 'axios'
import dayjs from 'dayjs'

interface Detail {
  item_id: number
  uom_id: number
  qty: number
  line_status: number
  create_user?: string
}

interface Header {
  order_type: number
  status: number
  priority: number
  hold_flag: string
  consignee_id: number
  currency_code: string
  order_value: number
  transport_mode: string
  service_level: string
  ship_window_from: string
  ship_window_to: string
  deliv_window_to?: string
  create_user?: string
  order_nbr?: string
}

interface Consignee { id: number; consignee_name: string }
interface Item { id: number; item_name: string }
interface Uom { uom_id: number; uom_desc: string }
interface OrderType { id: number; type: string }
interface StatusOption { id: number; label: string }

export default function CreateOrderPage() {
  const [submitting, setSubmitting] = useState(false)
  const [consignees, setConsignees] = useState<Consignee[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [uomsMap, setUomsMap] = useState<Record<number, Uom[]>>({})
  const [orderTypes, setOrderTypes] = useState<OrderType[]>([])
  const [statuses, setStatuses] = useState<StatusOption[]>([])
  const router = useRouter()

  useEffect(() => {
    axios.get<Consignee[]>('/api/consignees')
      .then(res => setConsignees(res.data))
      .catch(err => console.error('Failed to load consignees', err))
    axios.get<Item[]>('/api/items')
      .then(res => setItems(res.data))
      .catch(err => console.error('Failed to load items', err))
    axios.get<OrderType[]>('/api/order-types')
      .then(res => setOrderTypes(res.data))
      .catch(err => console.error('Failed to load order types', err))
    axios.get<StatusOption[]>('/api/statuses')
      .then(res => setStatuses(res.data))
      .catch(err => console.error('Failed to load statuses', err))
  }, [])

  const fetchUoms = (itemId: number, index: number) => {
    axios.get<Uom[]>(`/api/items/${itemId}/uoms`)
      .then(res => setUomsMap(prev => ({ ...prev, [index]: res.data })))
      .catch(err => console.error(`Failed to load UOMs for item ${itemId}`, err))
  }
  
  const onFinish = async (values: any) => {
    setSubmitting(true)
    const generatedNbr = `ORD-${dayjs().format('YYYYMMDDHHmmss')}`
    const header: Header = {
      ...values.header,
      order_type: values.header.order_type,
      status: values.header.status,
      order_nbr: generatedNbr,
      ship_window_from: values.header.ship_window_from.format('YYYY-MM-DD'),
      ship_window_to:   values.header.ship_window_to.format('YYYY-MM-DD'),
      deliv_window_to:  values.header.deliv_window_to
        ? values.header.deliv_window_to.format('YYYY-MM-DD')
        : undefined,
    }
    const details: Detail[] = (values.details || []).map((d: any) => ({
      item_id: d.item_id,
      uom_id: d.uom_id,
      qty: d.qty,
      line_status: d.line_status,
      create_user: d.create_user || undefined,
    }))

    try {
      const { data } = await axios.post('/api/orders', { header, details })
      message.success(`Order created: ${generatedNbr} (ID ${data.id})`)
      router.push('/orders')
    } catch (err) {
      console.error(err)
      message.error('Failed to create order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card title="Create Order" className="m-4">
      <Form
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          header: {
            order_type: orderTypes[0]?.id,
            status: "DRAFT",
            priority: 1,
            hold_flag: 'N',
            transport_mode: 'TRK',
            ship_window_from: dayjs(),
            ship_window_to: dayjs().add(1, 'day'),
          },
          details: [],
        }}
      >
        <Divider>Header</Divider>
        <Space wrap>
          <Form.Item name={[ 'header', 'order_type' ]} label="Type" rules={[{ required: true }]}>  
            <Select placeholder="Select order type">
              {orderTypes.map(o => (
                <Select.Option key={o.id} value={o.id}>{o.type}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name={[ 'header', 'status' ]} label="Status">
  <Select
    disabled
    placeholder="Status fixed"
  >
    {statuses.map(s => (
      <Select.Option key={s.id} value={s.id}>
        {s.label}
      </Select.Option>
    ))}
  </Select>
</Form.Item>
          <Form.Item name={[ 'header', 'priority' ]} label="Priority" rules={[{ required: true }]}>  
            <InputNumber min={1} max={5} />
          </Form.Item>
          <Form.Item name={[ 'header', 'consignee_id' ]} label="Consignee" rules={[{ required: true }]}>  
            <Select placeholder="Select consignee">
              {consignees.map(c => (
                <Select.Option key={c.id} value={c.id}>{c.consignee_name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name={[ 'header', 'currency_code' ]} label="Currency" rules={[{ required: true }]}>  
            <Select placeholder="Select currency">
              <Select.Option value="USD">USD</Select.Option>
              <Select.Option value="MXN">MXN</Select.Option>
              <Select.Option value="SOL">SOL</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name={[ 'header', 'order_value' ]} label="Value" rules={[{ required: true }]}>  
            <InputNumber step={0.01} prefix="$" />
          </Form.Item>
          <Form.Item name={[ 'header', 'transport_mode' ]} label="Mode" rules={[{ required: true }]}>  
            <Input />
          </Form.Item>
          <Form.Item name={[ 'header', 'service_level' ]} label="Service Level">  
            <Input />
          </Form.Item>
          <Form.Item name={[ 'header', 'ship_window_from' ]} label="Ship From" rules={[{ required: true }]}>  
            <DatePicker />
          </Form.Item>
          <Form.Item name={[ 'header', 'ship_window_to' ]} label="Ship To" rules={[{ required: true }]}>  
            <DatePicker />
          </Form.Item>
          <Form.Item name={[ 'header', 'deliv_window_to' ]} label="Delivery To">  
            <DatePicker />
          </Form.Item>
        </Space>

        <Divider>Details</Divider>
        <Form.List name="details">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} align="baseline" wrap>
                  <Form.Item
                    {...restField}
                    name={[ name, 'item_id' ]}
                    label="Item"
                    rules={[{ required: true }]}
                  >
                    <Select
                      showSearch
                      placeholder="Select item"
                      optionFilterProp="children"
                      onChange={value => fetchUoms(value, name)}
                      filterOption={(input, option) =>
                        (option?.children as string).toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {items.map(it => (
                        <Select.Option key={it.id} value={it.id}>{it.item_name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[ name, 'uom_id' ]}
                    label="UOM"
                    rules={[{ required: true }]}
                  >
                    <Select placeholder="Select UOM">
                      {(uomsMap[name] || []).map(u => (
                        <Select.Option key={u.uom_id} value={u.uom_id}>{u.uom_desc}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item {...restField} name={[ name, 'qty' ]} label="Qty" rules={[{ required: true }]}>  
                    <InputNumber step={0.01} />
                  </Form.Item>
                  <Form.Item {...restField} name={[ name, 'line_status' ]} label="Line Status" rules={[{ required: true }]}>  
                    <InputNumber />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Add Detail</Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>Create Order</Button>
        </Form.Item>
      </Form>
    </Card>
  )
}
