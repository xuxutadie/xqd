import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)
    if (auth instanceof NextResponse) return auth

    try {
      await connectDB()
      const user = await User.findById(auth.userId).select('-password')
      if (!user) {
        return NextResponse.json({ error: '用户不存在' }, { status: 404 })
      }
      return NextResponse.json({ user }, { status: 200 })
    } catch (dbErr) {
      console.warn('数据库不可用，返回最小信息:', dbErr)
      // 演示模式下的最小响应
      return NextResponse.json({
        user: {
          _id: auth.userId,
          username: '用户',
          fullName: '',
          className: '',
          avatarUrl: ''
        }
      }, { status: 200 })
    }
  } catch (e) {
    console.error('获取个人信息失败:', e)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)
    if (auth instanceof NextResponse) return auth

    const body = await request.json().catch(() => ({}))
    const name: string = body.name ?? body.fullName ?? ''
    const className: string = body.className ?? ''
    const avatarUrl: string = body.avatarUrl ?? ''

    if (!name) {
      return NextResponse.json({ error: '姓名为必填项' }, { status: 400 })
    }

    try {
      await connectDB()
      const updated = await User.findByIdAndUpdate(
        auth.userId,
        {
          username: name,
          fullName: name,
          className,
          avatarUrl,
          updatedAt: new Date()
        },
        { new: true }
      ).select('-password')

      if (!updated) {
        return NextResponse.json({ error: '用户不存在' }, { status: 404 })
      }

      return NextResponse.json({ message: '更新成功', user: updated }, { status: 200 })
    } catch (dbErr) {
      console.warn('数据库更新失败，演示模式返回成功:', dbErr)
      return NextResponse.json({
        message: '更新成功（演示模式）',
        user: {
          _id: auth.userId,
          username: name,
          fullName: name,
          className,
          avatarUrl
        }
      }, { status: 200 })
    }
  } catch (e) {
    console.error('更新个人信息失败:', e)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}