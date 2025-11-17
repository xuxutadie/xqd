import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { pickUploadTarget } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)
    if (auth instanceof NextResponse) return auth

    const form = await request.formData()
    const file = form.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: '缺少文件' }, { status: 400 })
    }

    const target = await pickUploadTarget('avatars')
    const uploadDir = target.dir
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5.]/g, '_')
    const fileName = `${timestamp}_${safeName}`
    const filePath = join(uploadDir, fileName)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    const url = `/uploads/avatars/${fileName}`
    return NextResponse.json({ url }, { status: 201 })
  } catch (e) {
    console.error('头像上传失败:', e)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}