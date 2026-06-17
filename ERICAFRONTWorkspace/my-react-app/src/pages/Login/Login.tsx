import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './Login.css'

type LoginResponseData = {
  token?: string
  user_id?: number | string
  userId?: number | string
  user_name?: string
  userName?: string
  username?: string
  name?: string
  email?: string
  rank?: number | string
  department?: string
  team?: string
  role?: string
  branch_id?: number | string | null
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname || '/device/status'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const result = await res.json()
      if (!res.ok) {
        setError(result.message || '로그인에 실패했습니다.')
        return
      }

      const data: LoginResponseData = result.data || result
      const token = data.token
      const userId = data.user_id ?? data.userId
      const userName = data.user_name ?? data.userName ?? data.username ?? data.name ?? data.email ?? username

      const role = data.role ?? 'ADMIN'
      const branchId = data.branch_id != null ? data.branch_id : null

      if (token) localStorage.setItem('token', token)
      if (userId != null) localStorage.setItem('userId', String(userId))
      localStorage.setItem('userName', String(userName))
      localStorage.setItem('role', role)
      if (branchId != null) localStorage.setItem('branchId', String(branchId))
      else localStorage.removeItem('branchId')

      localStorage.setItem('loginUser', JSON.stringify({
        ...data,
        user_id: userId,
        userId,
        user_name: userName,
        userName,
        role,
        branch_id: branchId,
      }))

      navigate(from, { replace: true })
    } catch {
      setError('서버에 연결할 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">임대관리시스템</h1>
        <p className="login-subtitle">관리자 로그인</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="username">아이디</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="아이디 입력"
              required
              autoFocus
            />
          </div>
          <div className="login-field">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              required
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}
