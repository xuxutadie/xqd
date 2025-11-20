import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/lib/auth'
import { mkdir, readdir, readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-dynamic'

const DATA_DIR = join(process.cwd(), 'public', 'data')
const BACKUP_DIR = join(DATA_DIR, 'backups')

const FILES = [
  'website-config.json',
  'permissions.json',
  'works-meta.json'
]

export async function GET(request: NextRequest) {
  const auth = await authMiddleware(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  try {
    if (!existsSync(BACKUP_DIR)) await mkdir(BACKUP_DIR, { recursive: true })
    const list = await readdir(BACKUP_DIR)
    const backups = list.filter(n => n.endsWith('.json')).sort().reverse().slice(0, 20)
    return NextResponse.json({ backups }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await authMiddleware(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  try {
    const body = await request.json().catch(() => ({}))
    const action = String(body.action || '')
    if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true })
    if (!existsSync(BACKUP_DIR)) await mkdir(BACKUP_DIR, { recursive: true })

    if (action === 'backup') {
      const payload: Record<string, any> = {}
      for (const name of FILES) {
        try {
          const p = join(DATA_DIR, name)
          const txt = await readFile(p, 'utf-8')
          payload[name] = txt ? JSON.parse(txt) : {}
        } catch { payload[name] = {} }
      }
      const fileName = `backup-${Date.now()}.json`
      await writeFile(join(BACKUP_DIR, fileName), JSON.stringify(payload, null, 2), 'utf-8')
      return NextResponse.json({ message: 'ok', name: fileName }, { status: 200 })
    }

    if (action === 'restore') {
      const name = String(body.name || '')
      if (!name || /[\\/]/.test(name) || !name.endsWith('.json')) {
        return NextResponse.json({ error: '文件名不合法' }, { status: 400 })
      }
      const bfile = join(BACKUP_DIR, name)
      const txt = await readFile(bfile, 'utf-8')
      const payload = txt ? JSON.parse(txt) : {}
      for (const key of FILES) {
        const target = join(DATA_DIR, key)
        await writeFile(target, JSON.stringify(payload[key] || {}, null, 2), 'utf-8')
      }
      return NextResponse.json({ message: 'ok' }, { status: 200 })
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}