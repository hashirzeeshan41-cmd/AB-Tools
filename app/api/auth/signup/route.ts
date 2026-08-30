import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name } = body
    if (!email || !password) {
      return NextResponse.json({ success: false, error: { message: 'Email and password are required' } }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ success: false, error: { message: 'User already exists' } }, { status: 409 })
    }

    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email, passwordHash: hash, name } })

    return NextResponse.json({ success: true, data: { id: user.id, email: user.email } })
  } catch (err) {
    return NextResponse.json({ success: false, error: { message: 'Server error' } }, { status: 500 })
  }
}
