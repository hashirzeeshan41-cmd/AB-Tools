export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Queue } from 'bullmq'
import IORedis from 'ioredis'

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379')
const queue = new Queue('pdf-jobs', { connection })

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { fileId } = body
    if (!fileId) return NextResponse.json({ success: false, error: { message: 'fileId is required' } }, { status: 400 })

    const file = await prisma.file.findUnique({ where: { id: fileId } })
    if (!file) return NextResponse.json({ success: false, error: { message: 'File not found' } }, { status: 404 })

    const job = await prisma.processingJob.create({ data: { fileId: fileId, tool: 'compress', status: 'pending' } })
    await queue.add('compress', { processingJobId: job.id, fileId })
    return NextResponse.json({ success: true, data: { jobId: job.id } })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: { message: 'Server error' } }, { status: 500 })
  }
}
