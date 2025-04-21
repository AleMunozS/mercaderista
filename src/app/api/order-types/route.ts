// app/api/order-types/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  // Trae todos los tipos de orden con id + type
  const types = await prisma.$queryRaw<{ id: number; type: string }[]>`
    SELECT id, \`type\`
    FROM om_order_type
    ORDER BY \`type\`
  `
  return NextResponse.json(types)
}
