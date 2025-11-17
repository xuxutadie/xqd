import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { storageConfig } from '@/config/storage'

function guessType(name: string) {
  const ext = name.toLowerCase().split('.').pop() || ''
  if (['jpg','jpeg','png','gif','webp'].includes(ext)) return 'image/' + (ext === 'jpg' ? 'jpeg' : ext)
  if (['mp4','webm','ogg'].includes(ext)) return 'video/' + ext
  if (['html','htm','xhtml'].includes(ext)) return 'text/html; charset=utf-8'
  if (['css'].includes(ext)) return 'text/css; charset=utf-8'
  if (['js'].includes(ext)) return 'application/javascript; charset=utf-8'
  return 'application/octet-stream'
}

export async function GET(_req: NextRequest, { params }: { params: { path: string[] } }) {
  const parts = Array.isArray(params.path) ? params.path : []
  if (parts.length < 2) return NextResponse.json({ error: 'invalid path' }, { status: 400 })
  const type = parts[0]
  const name = parts.slice(1).join('/')

  const primaryPath = join(storageConfig.primaryRoot, type, name)
  const secondaryPath = storageConfig.secondaryRoot ? join(storageConfig.secondaryRoot, type, name) : ''

  let filePath = ''
  if (existsSync(primaryPath)) filePath = primaryPath
  else if (secondaryPath && existsSync(secondaryPath)) filePath = secondaryPath
  else return NextResponse.json({ error: 'not found' }, { status: 404 })

  const buf = await readFile(filePath)
  const contentType = guessType(name)
  return new NextResponse(buf, { headers: { 'Content-Type': contentType } })
}