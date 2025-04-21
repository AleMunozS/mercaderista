// app/api/statuses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  // 1) Consultar todos los estados
  const rows = await prisma.$queryRaw<{
    id: number
    status: string
    lifecycle_tag: string
    description: string | null
  }[]>`
    SELECT id, status, lifecycle_tag, description
      FROM om_order_status_lkp
    ORDER BY id
  `

  // 2) Mapear a opciones para <Select>
  const options = rows.map(r => ({
    id: r.id,
    label: r.status
  }))

  return NextResponse.json(options)
}
