// app/api/consignees/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  try {
    // Obtener lista de consignees id + nombre
    const consignees = await prisma.$queryRaw<{ id: number; consignee_name: string }[]>`
      SELECT id, consignee_name
      FROM consignee
      ORDER BY consignee_name
    `
    return NextResponse.json(consignees)
  } catch (error) {
    console.error('Error fetching consignees:', error)
    return NextResponse.error()
  }
}
