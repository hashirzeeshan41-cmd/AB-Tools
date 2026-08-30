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
    const { fileIds } = body
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length < 1) {
      return NextResponse.json({ success: false, error: { message: 'fileIds (array) is required' } }, { status: 400 })
    }

    const files = await prisma.file.findMany({ where: { id: { in: fileIds } } })
    if (files.length !== fileIds.length) {
      return NextResponse.json({ success: false, error: { message: 'One or more files not found' } }, { status: 404 })
    }

    const job = await prisma.processingJob.create({ data: { fileId: fileIds[0], tool: 'split', status: 'pending' } })
    await queue.add('split', { processingJobId: job.id, fileIds })
    return NextResponse.json({ success: true, data: { jobId: job.id } })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: { message: 'Server error' } }, { status: 500 })
  }
}
