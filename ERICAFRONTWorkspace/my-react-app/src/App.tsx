import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import DeviceStatus from './pages/DeviceStatus/DeviceStatus'
import DeviceRental from './pages/DeviceRental/DeviceRental'
import DeviceBiometric from './pages/DeviceBiometric/DeviceBiometric'
import DeviceAS from './pages/DeviceAS/DeviceAS'
import BranchManagement from './pages/BranchManagement/BranchManagement'
import CenterInfo from './pages/CenterInfo/CenterInfo'
import DepartmentTeam from './pages/DepartmentTeam/DepartmentTeam'
import CenterEmployee from './pages/CenterEmployee/CenterEmployee'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/device/status" replace />} />
          <Route path="device/status" element={<DeviceStatus />} />
          <Route path="device/rental" element={<DeviceRental />} />
          <Route path="device/biometric" element={<DeviceBiometric />} />
          <Route path="device/as" element={<DeviceAS />} />
          <Route path="branch" element={<BranchManagement />} />
          <Route path="center" element={<CenterInfo />} />
          <Route path="department" element={<DepartmentTeam />} />
          <Route path="employee" element={<CenterEmployee />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
