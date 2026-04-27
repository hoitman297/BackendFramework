import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import './Layout.css'

export default function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-main">
        <header className="layout-header">
          <h1 className="header-title">임대관리시스템</h1>
          <div className="header-right">
            <span className="header-user">관리자</span>
          </div>
        </header>
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
