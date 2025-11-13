import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)
    if (auth instanceof NextResponse) return auth

    const form = await request.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: '缺少文件' }, { status: 400 })

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const ts = Date.now()
    const safe = file.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5.]/g, '_')
    const fileName = `${ts}_${safe}`
    const filePath = join(uploadDir, fileName)

    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    const url = `/uploads/avatars/${fileName}`
    return NextResponse.json({ url }, { status: 201 })
  } catch (e) {
    console.error('头像上传失败:', e)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}