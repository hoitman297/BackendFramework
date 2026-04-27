import { NavLink } from 'react-router-dom'
import './Sidebar.css'
import faviconSvg from '../../assets/favicon.svg';

const menuGroups = [
  {
    label: '디바이스 관리',
    items: [
      { path: '/device/status', label: '디바이스 현황' },
      { path: '/device/rental', label: '디바이스 임대 현황' },
      { path: '/device/biometric', label: '사용 생체 정보' },
      { path: '/device/as', label: 'AS 관리' },
    ],
  },
  {
    label: '지점/센터',
    items: [
      { path: '/branch', label: '지점 관리' },
      { path: '/center', label: '센터정보' },
    ],
  },
  {
    label: '조직 관리',
    items: [
      { path: '/department', label: '부서/팀' },
      { path: '/employee', label: '센터 담당직원' },
    ],
  },
]

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
          <img className="sidebar-logo-icon" src={faviconSvg} alt="" />
        <span>ERICA</span>
      </div>
      {menuGroups.map((group) => (
        <div className="sidebar-group" key={group.label}>
          <p className="sidebar-group-label">{group.label}</p>
          <ul className="sidebar-menu">
            {group.items.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    'sidebar-link' + (isActive ? ' active' : '')
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
