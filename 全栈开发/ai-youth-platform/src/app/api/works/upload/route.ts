import { NextRequest, NextResponse } from 'next/server'
import Work from '@/models/Work'
import connectDB from '@/lib/mongodb'
import { authMiddleware } from '@/lib/auth'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const authResult = await authMiddleware(request, ['student', 'teacher', 'admin'])
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const formData = await request.formData()
    const title = formData.get('title') as string
    const type = formData.get('type') as string
    const authorName = formData.get('authorName') as string
    const grade = formData.get('grade') as string
    const classNameFromForm = (formData.get('className') as string) || ''
    const file = formData.get('file') as File
    // 验证输入
    if (!title || !type || !authorName || !grade || !file) {
      return NextResponse.json(
        { error: '作品标题、类型、作者名字、年级和文件为必填项' },
        { status: 400 }
      )
    }
    
    // 创建上传目录（如果不存在）
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'works')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    
    // 生成唯一文件名
    const timestamp = Date.now()
    // 更安全的文件名处理，保留原始名称但替换特殊字符
    const originalName = file.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5.]/g, '_')
    // 在文件名中嵌入用户ID，便于从文件系统解析归属
    const safeUserId = String((authResult as any).userId || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_')
    const fileName = `${timestamp}_${safeUserId}_${originalName}`
    const filePath = join(uploadDir, fileName)
    
    // 保存文件
    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)
    } catch (fileError) {
      console.error('保存文件错误:', fileError)
      return NextResponse.json(
        { error: '文件保存失败' },
        { status: 500 }
      )
    }
    
    // 创建文件URL
    const fileUrl = `/uploads/works/${fileName}`

    // 写入作品元数据，便于在无数据库时也能展示作者与班级
    try {
      const dataDir = join(process.cwd(), 'public', 'data')
      const metaFile = join(dataDir, 'works-meta.json')
      if (!existsSync(dataDir)) {
        await mkdir(dataDir, { recursive: true })
      }
      let currentMeta: Record<string, any> = {}
      try {
        const content = await readFile(metaFile, 'utf-8')
        currentMeta = content ? JSON.parse(content) : {}
      } catch {
        currentMeta = {}
      }
      currentMeta[fileName] = {
        title,
        type,
        authorName,
        className: classNameFromForm, // 实际存储将在数据库处从用户信息补全
        grade,
        url: fileUrl,
        uploaderId: (authResult as any).userId || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      await writeFile(metaFile, JSON.stringify(currentMeta, null, 2), 'utf-8')
    } catch (metaError) {
      console.error('写入作品元数据错误:', metaError)
    }
    
    // 尝试连接数据库并保存作品信息
    try {
      await connectDB()
      
      // 读取用户资料以自动填充班级
      let autoClassName = ''
      try {
        const { default: User } = await import('@/models/User')
        const userDoc: any = await (User as any).findById(authResult.userId).select('className')
        autoClassName = userDoc?.className || ''
      } catch (e) {
        // 数据库不可用或查询失败时，回退到表单中的班级（若提供）
        autoClassName = classNameFromForm || ''
      }

      // 创建新作品
      const newWork = await Work.create({
        title,
        type,
        authorName,
        className: autoClassName,
        grade,
        url: fileUrl,
        uploaderId: authResult.userId
      })
      
      return NextResponse.json(
        { message: '作品上传成功', work: newWork },
        { status: 201 }
      )
    } catch (dbError) {
      // 如果是数据库连接错误，返回模拟成功响应
      if (dbError instanceof Error && (
        dbError.message.includes('ECONNREFUSED') || 
        dbError.message.includes('MongoNetworkError') ||
        dbError.message.includes('connect ECONNREFUSED')
      )) {
        // 创建模拟作品数据
        const mockWork = {
          _id: "mock_" + Date.now(),
          title,
          type,
          authorName,
          className: classNameFromForm,
          grade,
          url: fileUrl,
          uploaderId: authResult.userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        return NextResponse.json(
          { message: '作品上传成功（演示模式）', work: mockWork },
          { status: 201 }
        )
      }
      
      // 其他数据库错误，重新抛出
      throw dbError
    }
  } catch (error) {
    console.error('上传作品错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}