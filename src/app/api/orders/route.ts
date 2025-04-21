import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  // 1) Parsear parámetros
  const params = Object.fromEntries(req.nextUrl.searchParams.entries())
  const page     = parseInt(params.page     || '1', 10)
  const pageSize = parseInt(params.pageSize || '50', 10)
  const { search, statusCsv, typeCsv, startDate, endDate } = params

  // 2) Construir cláusulas WHERE dinámicas
  const whereClauses: string[] = []
  const binds: unknown[] = []

  if (search) {
    whereClauses.push(`
      (
        hdr.order_nbr        LIKE ?
        OR hdr.transport_mode LIKE ?
      )
    `)
    binds.push(`%${search}%`, `%${search}%`)
  }
  if (statusCsv) {
    whereClauses.push(`FIND_IN_SET(hdr.status, ?)`)
    binds.push(statusCsv)
  }
  if (typeCsv) {
    whereClauses.push(`FIND_IN_SET(hdr.order_type, ?)`)
    binds.push(typeCsv)
  }
  if (startDate) {
    whereClauses.push(`hdr.ship_window_from >= ?`)
    binds.push(startDate)
  }
  if (endDate) {
    whereClauses.push(`hdr.ship_window_to <= ?`)
    binds.push(endDate)
  }

  const whereSQL = whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : ''

  // 3) Calcular OFFSET para paginación
  const offset = (page - 1) * pageSize

  // 4) Montar la query completa
  const sql = `
    SELECT SQL_CALC_FOUND_ROWS
      hdr.id,
      hdr.order_nbr,
      hdr.order_type,
      hdr.status,
      hdr.priority,
      hdr.hold_flag,
      hdr.consignee_id,
      hdr.currency_code,
      hdr.order_value,
      hdr.incoterm_code,
      hdr.transport_mode,
      hdr.service_level,
      hdr.channel_code,
      hdr.ship_window_from,
      hdr.ship_window_to,
      hdr.deliv_window_to,
      hdr.create_date,
      COUNT(dtl.id)   AS line_count,
      SUM(dtl.qty)    AS total_qty
    FROM om_order_hdr AS hdr
    LEFT JOIN om_order_dtl AS dtl
      ON dtl.order_id = hdr.id
    ${whereSQL}
    GROUP BY
      hdr.id,
      hdr.order_nbr,
      hdr.order_type,
      hdr.status,
      hdr.priority,
      hdr.hold_flag,
      hdr.consignee_id,
      hdr.currency_code,
      hdr.order_value,
      hdr.incoterm_code,
      hdr.transport_mode,
      hdr.service_level,
      hdr.channel_code,
      hdr.ship_window_from,
      hdr.ship_window_to,
      hdr.deliv_window_to,
      hdr.create_date
    ORDER BY hdr.create_date DESC
    LIMIT ? OFFSET ?
  `

  const rowsRaw = await prisma.$queryRawUnsafe(sql, ...binds, pageSize, offset)
  const totalResult = await prisma.$queryRaw<{ total: bigint }[]>`SELECT FOUND_ROWS() AS total`
  const totalBigInt = totalResult[0]?.total ?? BigInt(0)

  const rows = (rowsRaw as Record<string, unknown>[]).map(row => {
    const obj: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(row)) {
      obj[key] = typeof value === 'bigint' ? Number(value) : value
    }
    return obj
  })

  return NextResponse.json({ rows, total: Number(totalBigInt) })
}

export async function POST(req: NextRequest) {
  // 1) Leer payload
  const { header: hdr = {}, details = [] } = await req.json()

  // 2) Insertar cabecera usando el status que viene en el payload
  const insertHdrSQL = `
    INSERT INTO om_order_hdr (
      order_nbr, order_type, status, priority, hold_flag,
      consignee_id, currency_code, order_value, incoterm_code,
      transport_mode, service_level, channel_code,
      ship_window_from, ship_window_to, deliv_window_to,
      create_date, create_user
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
  `
  const insertHdrBinds = [
    hdr.order_nbr,
    hdr.order_type,
    hdr.status,
    hdr.priority,
    hdr.hold_flag,
    hdr.consignee_id,
    hdr.currency_code,
    hdr.order_value,
    hdr.incoterm_code,
    hdr.transport_mode,
    hdr.service_level,
    hdr.channel_code,
    hdr.ship_window_from,
    hdr.ship_window_to,
    hdr.deliv_window_to ?? null,
    hdr.create_user ?? 'system',
  ]
  await prisma.$executeRawUnsafe(insertHdrSQL, ...insertHdrBinds)

  // 3) Obtener orderId
  const [{ id: orderIdBig }] = await prisma.$queryRaw<{ id: bigint }[]>`SELECT LAST_INSERT_ID() AS id`
  const orderId = Number(orderIdBig)

  // 4) Insertar líneas con line_nbr secuencial
  const insertDtlSQL = `
    INSERT INTO om_order_dtl (
      order_id, line_nbr, item_id, buyer_item_code, supplier_item_code,
      uom_id, qty, pack_uom_id, pack_qty, unit_cost,
      unit_price, weight, volume, lot_attr, country_of_origin,
      hts_code, alloc_qty, shipped_qty, received_qty,
      line_status, create_date, create_user
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?
    )
  `
  for (let idx = 0; idx < details.length; idx++) {
    const d = details[idx]
    const lineNbr = idx + 1
    const binds = [
      orderId,
      lineNbr,
      d.item_id,
      d.buyer_item_code ?? null,
      d.supplier_item_code ?? null,
      d.uom_id,
      d.qty,
      d.pack_uom_id   ?? null,
      d.pack_qty      ?? null,
      d.unit_cost     ?? null,
      d.unit_price    ?? null,
      d.weight        ?? null,
      d.volume        ?? null,
      d.lot_attr      ?? null,
      d.country_of_origin ?? null,
      d.hts_code      ?? null,
      d.alloc_qty     ?? null,
      d.shipped_qty   ?? null,
      d.received_qty  ?? null,
      d.line_status,
      d.create_user   ?? 'system',
    ]
    await prisma.$executeRawUnsafe(insertDtlSQL, ...binds)
  }

  // 5) Responder con id numérico
  return NextResponse.json({ id: orderId })
}
