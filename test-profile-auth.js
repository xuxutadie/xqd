// 测试 /api/profile 的认证与更新
async function testProfileAuth() {
  console.log('=== 测试 /api/profile 认证与更新 ===')
  try {
    const loginResp = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
    })
    const loginData = await loginResp.json()
    console.log('登录状态:', loginResp.status)
    if (!loginResp.ok) throw new Error(loginData.error || '登录失败')
    const token = loginData.token
    console.log('Token 前20位:', token.substring(0, 20) + '...')

    const getResp = await fetch('http://localhost:3000/api/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const getData = await getResp.json()
    console.log('GET /api/profile 状态:', getResp.status)
    console.log('GET /api/profile 响应:', getData)
    if (!getResp.ok) throw new Error(getData.error || '获取个人信息失败')

    const putResp = await fetch('http://localhost:3000/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: '测试用户', className: '王者班', avatarUrl: getData?.user?.avatarUrl || '' })
    })
    const putData = await putResp.json()
    console.log('PUT /api/profile 状态:', putResp.status)
    console.log('PUT /api/profile 响应:', putData)
    if (!putResp.ok) throw new Error(putData.error || '更新个人信息失败')

    console.log('=== 测试完成 ===')
  } catch (e) {
    console.error('测试错误:', e?.message || e)
  }
}

testProfileAuth()