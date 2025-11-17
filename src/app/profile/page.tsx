'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import useAuth from '@/hooks/useAuth'
import AvatarCropper from '@/components/AvatarCropper'

export default function ProfilePage() {
  const { isAuthenticated, user } = useAuth()
  const [name, setName] = useState('')
  const [className, setClassName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.username || '')
    }
  }, [user])

  useEffect(() => {
    // 拉取服务器端信息（兼容无数据库演示模式）
    const fetchInfo = async () => {
      try {
        const resp = await fetch('/api/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
        })
        if (resp.ok) {
          const data = await resp.json()
          const u = data.user || {}
          setName(u.username || u.fullName || name)
          setClassName(u.className || '')
          setPreview(u.avatarUrl || '')
        }
      } catch {}
    }
    if (isAuthenticated) fetchInfo()
  }, [isAuthenticated])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    if (!f) return
    setFile(f)
    setError('')
    setMessage('')
  }

  const onExport = (blob: Blob, url: string) => {
    setCroppedBlob(blob)
    setPreview(url)
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError('')
      setMessage('')

      let avatarUrl = preview
      // 先上传裁剪后的头像
      if (croppedBlob) {
        const fd = new FormData()
        fd.append('file', new File([croppedBlob], 'avatar.png', { type: 'image/png' }))
        const resp = await fetch('/api/upload/avatar', {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
          body: fd
        })
        if (resp.ok) {
          const data = await resp.json()
          avatarUrl = data.url
        }
      }

      // 更新个人信息（姓名与用户名合并）
      const putResp = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ name, className, avatarUrl })
      })

      if (!putResp.ok) {
        const j = await putResp.json().catch(() => ({}))
        throw new Error(j.error || '保存失败')
      }

      const j = await putResp.json()
      setMessage('保存成功')

      // 更新本地 user（兼容 useAuth 结构）
      try {
        const localUser = JSON.parse(localStorage.getItem('user') || '{}')
        localStorage.setItem('user', JSON.stringify({ ...localUser, username: name, avatarUrl }))
      } catch {}
    } catch (e: any) {
      setError(e?.message || '保存失败')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <main>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-700">请先登录后再编辑个人信息。</p>
          </div>
          <div className="flex justify-end mt-2">
            <a href="/profile/change-password" className="text-cyan-700 dark:text-cyan-200 hover:underline">修改密码</a>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6 space-y-6">
          <h1 className="text-2xl font-bold text-cyan-700">个人信息设置</h1>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-gray-600">姓名（与用户名合并）</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                placeholder="请输入姓名"
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-600">班级</span>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                placeholder="如：新起点一班"
              />
            </label>
          </div>

          <div className="space-y-3">
            <span className="text-sm text-gray-600">头像（本地上传+裁剪预览）</span>
            <input type="file" accept="image/*" onChange={onFileChange} />
            {file ? (
              <AvatarCropper file={file} onChange={setPreview} onExport={onExport} />
            ) : (
              preview ? (
                <img src={preview} alt="头像预览" className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200" />
              )
            )}
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}
          {message && <div className="text-green-600 text-sm">{message}</div>}

          <div className="flex justify-end gap-3">
            <a href="/" className="px-4 py-2 rounded-md bg-transparent ring-1 ring-cyan-600 text-cyan-700 hover:bg-cyan-50">返回</a>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50"
            >
              {loading ? '保存中…' : '保存信息'}
            </button>
          </div>
          <div className="flex justify-end mt-2">
            <a href="/profile/change-password" className="text-cyan-700 dark:text-cyan-200 hover:underline">修改密码</a>
          </div>
        </div>
      </div>
    </main>
  )
}