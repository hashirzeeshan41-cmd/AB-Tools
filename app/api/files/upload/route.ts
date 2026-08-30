export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getStorageAdapter } from '@/lib/storage'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const files = form.getAll('files') as any[]
    if (!files || files.length === 0) return NextResponse.json({ success: false, error: { message: 'No files provided' } }, { status: 400 })

    const adapter = getStorageAdapter()
    const created: any[] = []
    for (const f of files) {
      const filename = f.name || 'upload'
      const mimeType = f.type || 'application/octet-stream'
      // Simple MIME validation: allow PDFs and images for now
      const allowed = ['application/pdf', 'image/jpeg', 'image/png']
      if (!allowed.includes(mimeType)) {
        return NextResponse.json({ success: false, error: { message: `Unsupported MIME type: ${mimeType}` } }, { status: 400 })
      }
      const buffer = Buffer.from(await f.arrayBuffer())
      // size validation (10 MB limit for anon by default)
      const max = parseInt(process.env.MAX_UPLOAD_BYTES || String(50 * 1024 * 1024), 10)
      if (buffer.length > max) {
        return NextResponse.json({ success: false, error: { message: 'File exceeds maximum allowed size' } }, { status: 413 })
      }

      const { key, size } = await adapter.upload(buffer, filename, mimeType)
      const file = await prisma.file.create({ data: { filename, mimeType, size, storageKey: key } })
      created.push({ id: file.id, filename: file.filename, size: file.size })
    }

    return NextResponse.json({ success: true, data: created })
  } catch (err: any) {
    console.error('upload error', err)
    return NextResponse.json({ success: false, error: { message: 'Server error' } }, { status: 500 })
  }
}
