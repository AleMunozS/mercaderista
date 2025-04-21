import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { search } = Object.fromEntries(req.nextUrl.searchParams.entries())
  const where = search
    ? `WHERE item_name LIKE ? OR description LIKE ?`
    : ''
  const binds: unknown[] = []
  if (search) binds.push(`%${search}%`, `%${search}%`)

  const sql = `
    SELECT id, item_name, description
      FROM items
      ${where}
    ORDER BY item_name
    LIMIT 100
  `
  const items = await prisma.$queryRawUnsafe<{ id: number; item_name: string; description: string }[]>(
    sql,
    ...binds
  )
  return NextResponse.json(items)
}