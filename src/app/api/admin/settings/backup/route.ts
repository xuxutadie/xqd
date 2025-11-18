import { NextRequest } from 'next/server'
import { join } from 'path'
import { existsSync } from 'fs'
import { readFile, writeFile, mkdir, readdir } from 'fs/promises'
import { authMiddleware } from '@/lib/auth'
import { ok, badRequest } from '@/lib/http'

const dataDir = join(process.cwd(), 'public', 'data')
const backupsDir = join(dataDir, 'backups')

async function ensureDirs() {
  if (!existsSync(dataDir)) await mkdir(dataDir, { recursive: true })
  if (!existsSync(backupsDir)) await mkdir(backupsDir, { recursive: true })
}

async function readJson(path: string, fallback: any) {
  try {
    const content = await readFile(path, 'utf-8')
    return content ? JSON.parse(content) : fallback
  } catch { return fallback }
}

export async function GET(request: NextRequest) {
  const auth = await authMiddleware(request, ['admin'])
  if ('success' in (auth as any) === false) return auth
  await ensureDirs()
  const files = await readdir(backupsDir)
  const list = files.filter(f => f.endsWith('.json')).sort().reverse().slice(0, 20)
  return ok({ backups: list })
}

export async function POST(request: NextRequest) {
  const auth = await authMiddleware(request, ['admin'])
  if ('success' in (auth as any) === false) return auth
  await ensureDirs()
  try {
    const body = await request.json()
    const action = String(body.action || '')
    if (action === 'backup') {
      const site = await readJson(join(dataDir, 'site-config.json'), {})
      const users = await readJson(join(dataDir, 'users-meta.json'), [])
      const works = await readJson(join(dataDir, 'works-meta.json'), {})
      const payload = { ts: new Date().toISOString(), site, users, works }
      const name = `backup-${Date.now()}.json`
      await writeFile(join(backupsDir, name), JSON.stringify(payload, null, 2), 'utf-8')
      return ok({ message: '备份完成', name })
    }
    if (action === 'restore') {
      const name = String(body.name || '')
      if (!name) return badRequest('缺少备份文件名')
      const data = await readJson(join(backupsDir, name), null)
      if (!data) return badRequest('备份不存在')
      await writeFile(join(dataDir, 'site-config.json'), JSON.stringify(data.site ?? {}, null, 2), 'utf-8')
      await writeFile(join(dataDir, 'users-meta.json'), JSON.stringify(data.users ?? [], null, 2), 'utf-8')
      await writeFile(join(dataDir, 'works-meta.json'), JSON.stringify(data.works ?? {}, null, 2), 'utf-8')
      return ok({ message: '恢复完成' })
    }
    return badRequest('未知操作')
  } catch {
    return badRequest('请求体格式错误')
  }
}