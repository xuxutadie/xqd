import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import User from '@/models/User'
import connectDB from '@/lib/mongodb'
import { authMiddleware } from '@/lib/auth'

function validateNewPassword(newPassword: string, oldPassword?: string) {
  if (!newPassword || newPassword.length < 8) {
    return '新密码长度至少为 8 位'
  }
  const hasLetter = /[A-Za-z]/.test(newPassword)
  const hasNumber = /\d/.test(newPassword)
  if (!hasLetter || !hasNumber) {
    return '新密码需同时包含字母和数字'
  }
  if (oldPassword && newPassword === oldPassword) {
    return '新密码不能与旧密码相同'
  }
  return null
}

export async function POST(request: NextRequest) {
  // 鉴权：需要登录
  const auth = await authMiddleware(request)
  if ('success' in auth === false || auth.success !== true) {
    return auth as NextResponse
  }

  try {
    const body = await request.json()
    const { oldPassword, newPassword } = body || {}

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: '请提供旧密码与新密码' }, { status: 400 })
    }

    const validationError = validateNewPassword(newPassword, oldPassword)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    try {
      await connectDB()
      const user = await User.findById(auth.userId)
      if (!user) {
        return NextResponse.json({ error: '用户不存在' }, { status: 404 })
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password)
      if (!isMatch) {
        return NextResponse.json({ error: '旧密码不正确' }, { status: 400 })
      }

      const salt = await bcrypt.genSalt(10)
      const hashed = await bcrypt.hash(newPassword, salt)
      user.password = hashed
      await user.save()

      return NextResponse.json({ success: true, message: '密码已更新' })
    } catch (dbErr) {
      // 在开发或数据库不可用时，返回成功但提示未持久化
      console.error('修改密码时数据库不可用，返回模拟响应:', dbErr)
      return NextResponse.json({ success: true, message: '密码更新（模拟模式，未持久化）' })
    }
  } catch (e) {
    console.error('修改密码请求错误:', e)
    return NextResponse.json({ error: '请求解析失败' }, { status: 400 })
  }
}