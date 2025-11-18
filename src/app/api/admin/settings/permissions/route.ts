import { NextRequest } from 'next/server'
import { join } from 'path'
import { existsSync } from 'fs'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { authMiddleware } from '@/lib/auth'
import { ok, badRequest } from '@/lib/http'

type Role = 'admin' | 'teacher' | 'student'
type PermissionConfig = Record<Role, { viewUsers: boolean; editUsers: boolean; manageUploads: boolean; accessAdmin: boolean }>

const dataDir = join(process.cwd(), 'public', 'data')
const file = join(dataDir, 'permissions.json')

async function readConfig(): Promise<PermissionConfig> {
  if (!existsSync(file)) {
    return {
      admin: { viewUsers: true, editUsers: true, manageUploads: true, accessAdmin: true },
      teacher: { viewUsers: true, editUsers: false, manageUploads: true, accessAdmin: false },
      student: { viewUsers: false, editUsers: false, manageUploads: true, accessAdmin: false },
    }
  }
  try {
    const content = await readFile(file, 'utf-8')
    const cfg = content ? JSON.parse(content) : {}
    return {
      admin: cfg.admin ?? { viewUsers: true, editUsers: true, manageUploads: true, accessAdmin: true },
      teacher: cfg.teacher ?? { viewUsers: true, editUsers: false, manageUploads: true, accessAdmin: false },
      student: cfg.student ?? { viewUsers: false, editUsers: false, manageUploads: true, accessAdmin: false },
    }
  } catch {
    return {
      admin: { viewUsers: true, editUsers: true, manageUploads: true, accessAdmin: true },
      teacher: { viewUsers: true, editUsers: false, manageUploads: true, accessAdmin: false },
      student: { viewUsers: false, editUsers: false, manageUploads: true, accessAdmin: false },
    }
  }
}

async function writeConfig(cfg: PermissionConfig): Promise<PermissionConfig> {
  if (!existsSync(dataDir)) await mkdir(dataDir, { recursive: true })
  await writeFile(file, JSON.stringify(cfg, null, 2), 'utf-8')
  return cfg
}

export async function GET(request: NextRequest) {
  const auth = await authMiddleware(request, ['admin'])
  if ('success' in (auth as any) === false) return auth
  const cfg = await readConfig()
  return ok({ permissions: cfg })
}

export async function PUT(request: NextRequest) {
  const auth = await authMiddleware(request, ['admin'])
  if ('success' in (auth as any) === false) return auth
  try {
    const body = await request.json()
    if (!body || typeof body !== 'object') return badRequest('请求体格式错误')
    const merged: PermissionConfig = await readConfig()
    ;(['admin','teacher','student'] as Role[]).forEach(role => {
      if (body[role]) {
        merged[role] = {
          viewUsers: !!body[role].viewUsers,
          editUsers: !!body[role].editUsers,
          manageUploads: !!body[role].manageUploads,
          accessAdmin: !!body[role].accessAdmin,
        }
      }
    })
    const saved = await writeConfig(merged)
    return ok({ message: '保存成功', permissions: saved })
  } catch {
    return badRequest('请求体格式错误')
  }
}