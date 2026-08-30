export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const files = await prisma.file.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
  const data = files.map(f => ({ id: f.id, filename: f.filename, size: f.size }))
  return NextResponse.json({ success: true, data })
}
