export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const jobs = await prisma.processingJob.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
  const data = jobs.map(j => ({ id: j.id, tool: j.tool, status: j.status, resultKey: j.resultKey, createdAt: j.createdAt }))
  return NextResponse.json({ success: true, data })
}
