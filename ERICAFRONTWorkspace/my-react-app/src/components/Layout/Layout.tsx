import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import './Layout.css'

type LoginUser = {
  user_id?: number | string
  userId?: number | string
  user_name?: string
  userName?: string
  username?: string
  name?: string
  email?: string
}

function readJsonUser(raw: string | null): LoginUser | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as LoginUser
  } catch {
    return null
  }
}

function getLoginUserName() {
  // Login.tsx에서 localStorage.setItem('userName', user_name)으로 저장하므로
  // 단일 값 userName을 가장 먼저 확인한다.
  const directName = localStorage.getItem('userName') || sessionStorage.getItem('userName')
  if (directName && directName.trim()) return directName

  // 혹시 다른 로그인 코드에서 객체 형태로 저장한 경우도 대응한다.
  const storageKeys = ['loginUser', 'currentUser', 'user', 'authUser']
  for (const key of storageKeys) {
    const parsed = readJsonUser(localStorage.getItem(key) || sessionStorage.getItem(key))
    const name = parsed?.user_name || parsed?.userName || parsed?.username || parsed?.name || parsed?.email
    if (name && String(name).trim()) return String(name)
  }

  return '사용자'
}

export default function Layout() {
  const userName = getLoginUserName()

  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-main">
        <header className="layout-header">
          <h1 className="header-title">임대관리시스템</h1>
          <div className="header-right">
            <span className="header-user">{userName}님</span>
          </div>
        </header>
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
