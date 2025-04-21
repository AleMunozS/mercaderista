import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const [id] = req.nextUrl.pathname.match(/\/api\/items\/(\d+)\//)!.slice(1)
  // Obtener UOMs disponibles para el item
  const sql = `
    SELECT iu.uom_id, iu.uom_desc, iu.conv_factor
      FROM item_uom iu
      WHERE iu.item_id = ?
      ORDER BY iu.uom_desc
  `
  const uoms = await prisma.$queryRawUnsafe<{ uom_id: number; uom_desc: string; conv_factor: number }[]>(
    sql,
    Number(id)
  )
  return NextResponse.json(uoms)
}