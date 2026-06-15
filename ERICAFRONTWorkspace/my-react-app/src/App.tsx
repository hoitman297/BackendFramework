import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout/Layout'
import Login from './pages/Login/Login'
import DeviceStatus from './pages/DeviceStatus/DeviceStatus'
import DeviceRental from './pages/DeviceRental/DeviceRental'
import DeviceBiometric from './pages/DeviceBiometric/DeviceBiometric'
import DeviceAS from './pages/DeviceAS/DeviceAS'
import BranchManagement from './pages/BranchManagement/BranchManagement'
import CenterInfo from './pages/CenterInfo/CenterInfo'
import DepartmentTeam from './pages/DepartmentTeam/DepartmentTeam'
import CenterEmployee from './pages/CenterEmployee/CenterEmployee'
import DeviceModelPage from './pages/DeviceModel/DeviceModel'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/device/status" replace />} />
          <Route path="device/status" element={<DeviceStatus />} />
          <Route path="device/rental" element={<DeviceRental />} />
          <Route path="device/biometric" element={<DeviceBiometric />} />
          <Route path="device/as" element={<DeviceAS />} />
          <Route path="device/model" element={<DeviceModelPage />} />
          <Route path="branch" element={<BranchManagement />} />
          <Route path="center" element={<CenterInfo />} />
          <Route path="department" element={<DepartmentTeam />} />
          <Route path="employee" element={<CenterEmployee />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
