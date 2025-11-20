import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/lib/auth'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-dynamic'

type Role = 'admin' | 'teacher' | 'student'
type Perm = { viewUsers: boolean; editUsers: boolean; manageUploads: boolean; accessAdmin: boolean }

const DATA_DIR = join(process.cwd(), 'public', 'data')
const FILE = join(DATA_DIR, 'permissions.json')

function defaultPerms(): Record<Role, Perm> {
  return {
    admin: { viewUsers: true, editUsers: true, manageUploads: true, accessAdmin: true },
    teacher: { viewUsers: true, editUsers: false, manageUploads: true, accessAdmin: false },
    student: { viewUsers: false, editUsers: false, manageUploads: true, accessAdmin: false },
  }
}

export async function GET(request: NextRequest) {
  const auth = await authMiddleware(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  try {
    if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true })
    let perms = defaultPerms()
    try {
      const txt = await readFile(FILE, 'utf-8')
      if (txt) perms = JSON.parse(txt)
    } catch {}
    return NextResponse.json({ permissions: perms }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const auth = await authMiddleware(request, ['admin'])
  if (auth instanceof NextResponse) return auth
  try {
    const body = await request.json().catch(() => ({}))
    const roles: Role[] = ['admin', 'teacher', 'student']
    const keys: (keyof Perm)[] = ['viewUsers','editUsers','manageUploads','accessAdmin']
    const out: Record<Role, Perm> = defaultPerms()
    roles.forEach(r => {
      const v = body?.[r] || {}
      const p: any = {}
      keys.forEach(k => { p[k] = Boolean(v?.[k]) })
      ;(out as any)[r] = p
    })
    if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true })
    await writeFile(FILE, JSON.stringify(out, null, 2), 'utf-8')
    return NextResponse.json({ message: 'ok', permissions: out }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}