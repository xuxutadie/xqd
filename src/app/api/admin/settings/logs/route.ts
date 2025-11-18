import { NextRequest } from 'next/server'
import { join } from 'path'
import { existsSync } from 'fs'
import { readFile, writeFile, appendFile, mkdir } from 'fs/promises'
import { authMiddleware } from '@/lib/auth'
import { ok, badRequest } from '@/lib/http'

const dataDir = join(process.cwd(), 'public', 'data')
const logFile = join(dataDir, 'system.log')

async function ensureDir() {
  if (!existsSync(dataDir)) await mkdir(dataDir, { recursive: true })
  if (!existsSync(logFile)) await writeFile(logFile, '', 'utf-8')
}

export async function GET(request: NextRequest) {
  const auth = await authMiddleware(request, ['admin'])
  if ('success' in (auth as any) === false) return auth
  await ensureDir()
  const content = await readFile(logFile, 'utf-8')
  const lines = content.split('\n').filter(Boolean)
  const last = lines.slice(-200)
  return ok({ lines: last })
}

export async function POST(request: NextRequest) {
  const auth = await authMiddleware(request, ['admin'])
  if ('success' in (auth as any) === false) return auth
  await ensureDir()
  try {
    const body = await request.json()
    const msg = String(body.message || '').trim()
    if (!msg) return badRequest('缺少日志内容')
    const line = `${new Date().toISOString()} ${msg}\n`
    await appendFile(logFile, line, 'utf-8')
    return ok({ message: '已写入' })
  } catch {
    return badRequest('请求体格式错误')
  }
}