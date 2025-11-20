import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/lib/auth'
import { mkdir, readFile, appendFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-dynamic'

const DATA_DIR = join(process.cwd(), 'public', 'data')
const LOG_FILE = join(DATA_DIR, 'system.log')

export async function GET(request: NextRequest) {
  const auth = await authMiddleware(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  try {
    if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true })
    let content = ''
    try { content = await readFile(LOG_FILE, 'utf-8') } catch {}
    const lines = content ? content.split(/\r?\n/).slice(-200) : []
    return NextResponse.json({ lines }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await authMiddleware(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  try {
    const body = await request.json().catch(() => ({}))
    const msg = String(body.message || '').trim()
    if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true })
    const prefix = new Date().toISOString()
    const who = `${(auth as any).role}:${(auth as any).userId}`
    const line = `${prefix} [${who}] ${msg || '(empty)'}\n`
    await appendFile(LOG_FILE, line, 'utf-8')
    return NextResponse.json({ message: 'ok' }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}