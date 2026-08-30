export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getStorageAdapter } from '@/lib/storage'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    const key = url.searchParams.get('key')
    if (!id && !key) return NextResponse.json({ success: false, error: { message: 'id or key is required' } }, { status: 400 })

    let storageKey = key || undefined
    if (id) {
      const file = await prisma.file.findUnique({ where: { id } })
      if (!file) return NextResponse.json({ success: false, error: { message: 'File not found' } }, { status: 404 })
      storageKey = file.storageKey
    }

    const adapter = getStorageAdapter()
    const buf = await adapter.download(storageKey!)
    const headers: Record<string,string> = { 'Content-Type': 'application/octet-stream' }
    // Attempt to set filename using DB lookup when id provided
    if (id) {
      const file = await prisma.file.findUnique({ where: { id } })
      if (file) headers['Content-Disposition'] = `attachment; filename="${file.filename}"`
    }

    return new NextResponse(buf, { status: 200, headers })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: { message: 'Server error' } }, { status: 500 })
  }
}
