import { useState, useEffect } from 'react'
import PageHeader from '../../components/common/PageHeader'
import ToolBar from '../../components/common/ToolBar'
import DataTable from '../../components/common/DataTable'
import SummaryCard from '../../components/common/SummaryCard'
import StatusBadge from '../../components/common/StatusBadge'
import Modal from '../../components/common/Modal'
import { api } from '../../services/api'
import { isStaff, getStaffBranchId } from '../../services/auth'
import Toast, { useToast } from '../../components/common/Toast'
import './DeviceBiometric.css'

interface DeviceLog {
  log_id: number
  device_id: number
  user_id: number
  user_name: string
  branch_name: string
  model_id: number
  model_name: string
  battery_level?: number
  last_used_date: string
  usage_time_per_day: number
  total_usage_time: number
  resp_rate_per_day: number
  steps_per_day: number
  total_steps?: number
  last_location: string
  created_at: string
  emergency_id?: number
  type_emergency?: number
  emergency_time?: string
  status_emergency?: number
}

interface DeviceModel {
  model_id: number
  model_name: string
}

interface DeviceOption {
  device_id: number
  model_name: string
  branch_id: number
  branch_name: string
  user_id: number
  device_status: number
}

interface UserOption {
  user_id: number
  user_name: string
  email: string
}

const EMERGENCY_TYPE_MAP: Record<number, string> = {
  0: '과호흡',
  1: '낙상',
  2: '이상징후',
  3: '기타',
}

const EMERGENCY_STATUS_MAP: Record<number, string> = {
  0: '발생',
  1: '확인중',
  2: '해결',
}

const EMPTY_LOG_FORM = {
  device_id: '',
  user_id: '',
  usage_time_per_day: '',
  total_usage_time: '',
  resp_rate_per_day: '',
  steps_per_day: '',
  total_steps: '',
  last_location: '',
}

export default function DeviceBiometric() {
  const { toast, showToast } = useToast()
  const staff = isStaff()
  const staffBranchId = getStaffBranchId()
  const [logs, setLogs] = useState<DeviceLog[]>([])
  const [models, setModels] = useState<DeviceModel[]>([])
  const [devices, setDevices] = useState<DeviceOption[]>([])
  const [users, setUsers] = useState<UserOption[]>([])
  const [loading, setLoading] = useState(false)

  const [selectedModelId, setSelectedModelId] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const [detailLog, setDetailLog] = useState<DeviceLog | null>(null)

  // 생체 데이터 등록 모달
  const [showLogForm, setShowLogForm] = useState(false)
  const [logForm, setLogForm] = useState({ ...EMPTY_LOG_FORM })
  const [logSaving, setLogSaving] = useState(false)

  // 응급 신고 모달
  const [showEmergency, setShowEmergency] = useState(false)
  const [emgForm, setEmgForm] = useState({
    device_id: '',
    user_id: '',
    type_emergency: '0',
    location_address: '',
  })
  const [emgSaving, setEmgSaving] = useState(false)

  const fetchModels = async () => {
    try {
      const res = await api.get<DeviceModel[]>('/device-models')
      setModels(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchDevices = async () => {
    try {
      const url = staff && staffBranchId ? `/devices?branch_id=${staffBranchId}` : '/devices'
      const res = await api.get<DeviceOption[]>(url)
      setDevices(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchUsers = async () => {
    try {
      const res = await api.get<UserOption[]>('/users')
      setUsers(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const url = staff && staffBranchId ? `/logs?branch_id=${staffBranchId}` : '/logs'
      const res = await api.get<DeviceLog[]>(url)
      setLogs(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchModels(); fetchDevices(); fetchUsers(); fetchLogs() }, [])

  const filtered = logs.filter((row) => {
    const matchBranch = !staff || devices.some((d) => d.device_id === row.device_id)
    const matchModel = !selectedModelId || row.model_id === selectedModelId
    const matchSearch = !search || [row.user_name, row.branch_name, row.model_name, String(row.device_id)].some((v) => v?.includes(search))
    return matchBranch && matchModel && matchSearch
  })

  const modelLogCount = (modelId: number) => logs.filter((l) => l.model_id === modelId).length
  const emergencyCount = logs.filter((l) => l.emergency_id != null).length
  const scopedLogs = selectedModelId ? logs.filter((l) => l.model_id === selectedModelId) : logs

  // 디바이스 선택 시 해당 디바이스의 user_id 자동 설정
  const handleLogDeviceChange = (deviceId: string) => {
    const d = devices.find((x) => x.device_id === Number(deviceId))
    setLogForm({
      ...logForm,
      device_id: deviceId,
      user_id: d ? String(d.user_id) : logForm.user_id,
    })
  }

  const handleRegisterLog = async () => {
    if (!logForm.device_id || !logForm.user_id) {
      showToast('디바이스와 사용자는 필수입니다.', 'error')
      return
    }
    if (logForm.usage_time_per_day && logForm.total_usage_time) {
      if (Number(logForm.total_usage_time) < Number(logForm.usage_time_per_day)) {
        showToast('총사용시간은 사용시간/일보다 작을 수 없습니다.', 'error')
        return
      }
    }
    if (logForm.steps_per_day && logForm.total_steps) {
      if (Number(logForm.total_steps) < Number(logForm.steps_per_day)) {
        showToast('총 걸음수는 걸음수/일보다 작을 수 없습니다.', 'error')
        return
      }
    }
    setLogSaving(true)
    try {
      await api.post('/logs', {
        device_id: Number(logForm.device_id),
        user_id: Number(logForm.user_id),
        usage_time_per_day: logForm.usage_time_per_day ? Number(logForm.usage_time_per_day) : null,
        total_usage_time: logForm.total_usage_time ? Number(logForm.total_usage_time) : null,
        resp_rate_per_day: logForm.resp_rate_per_day ? Number(logForm.resp_rate_per_day) : null,
        steps_per_day: logForm.steps_per_day ? Number(logForm.steps_per_day) : null,
        total_steps: logForm.total_steps ? Number(logForm.total_steps) : null,
        last_location: logForm.last_location || null,
      })
      setShowLogForm(false)
      setLogForm({ ...EMPTY_LOG_FORM })
      await fetchLogs()
    } catch (err: any) {
      showToast(err.message || '생체 데이터 등록에 실패했습니다.', 'error')
    } finally {
      setLogSaving(false)
    }
  }

  // 응급 신고 시 device 선택 → user 자동 설정
  const handleEmgDeviceChange = (deviceId: string) => {
    const d = devices.find((x) => x.device_id === Number(deviceId))
    setEmgForm({
      ...emgForm,
      device_id: deviceId,
      user_id: d ? String(d.user_id) : emgForm.user_id,
    })
  }

  const handleRegisterEmergency = async () => {
    if (!emgForm.device_id || !emgForm.user_id) {
      showToast('디바이스와 사용자는 필수입니다.', 'error')
      return
    }
    setEmgSaving(true)
    try {
      await api.post('/emergencies', {
        device_id: Number(emgForm.device_id),
        user_id: Number(emgForm.user_id),
        type_emergency: Number(emgForm.type_emergency),
        location_address: emgForm.location_address || null,
      })
      setShowEmergency(false)
      setEmgForm({ device_id: '', user_id: '', type_emergency: '0', location_address: '' })
      await fetchLogs()
    } catch (err: any) {
      showToast(err.message || '응급 신고에 실패했습니다.', 'error')
    } finally {
      setEmgSaving(false)
    }
  }

  const columns = [
    { key: 'no', label: '순번', width: '50px' },
    { key: 'branch_name', label: '지점', render: (v: unknown) => v ? String(v) : '-' },
    { key: 'device_id', label: '디바이스ID' },
    { key: 'model_name', label: '모델명', render: (v: unknown) => v ? String(v) : '-' },
    {
      key: 'battery_level', label: '배터리',
      render: (v: unknown) => {
        if (v == null) return <span className="text-muted">-</span>
        const pct = Number(v)
        const cls = pct <= 20 ? 'battery-low' : pct <= 50 ? 'battery-mid' : 'battery-ok'
        return <span className={`battery-badge ${cls}`}>{pct}%</span>
      },
    },
    { key: 'user_name', label: '사용자', render: (v: unknown) => v ? String(v) : '-' },
    { key: 'last_used_date', label: '최근사용일', render: (v: unknown) => v ? String(v).slice(0, 10) : '-' },
    { key: 'last_used_date', label: '최근사용시간', render: (v: unknown) => v ? String(v).slice(11, 16) : '-' },
    { key: 'usage_time_per_day', label: '사용시간/일', render: (v: unknown) => v != null ? `${v}분` : '-' },
    { key: 'total_usage_time', label: '총사용시간', render: (v: unknown) => v != null ? `${(Number(v) / 60).toFixed(1)}h` : '-' },
    { key: 'resp_rate_per_day', label: '호흡수/일', render: (v: unknown) => v != null ? `${v}회/분` : '-' },
    { key: 'steps_per_day', label: '걸음수/일', render: (v: unknown) => v != null ? Number(v).toLocaleString() : '-' },
    { key: 'total_steps', label: '총걸음수', render: (v: unknown) => v != null ? Number(v).toLocaleString() : '-' },
    {
      key: 'emergency_id', label: '응급',
      render: (v: unknown, row: any) => {
        if (v == null) return <span className="text-muted">-</span>
        const type = EMERGENCY_TYPE_MAP[row.type_emergency] || '응급'
        const status = EMERGENCY_STATUS_MAP[row.status_emergency] || ''
        return <StatusBadge status={`${type}${status ? `(${status})` : ''}`} />
      },
    },
    { key: 'emergency_time', label: '응급기록시간', render: (v: unknown) => v ? String(v).slice(0, 16).replace('T', ' ') : '-' },
    { key: 'last_location', label: '최근사용자위치', render: (v: unknown) => v ? String(v) : '-' },
    { key: 'created_at', label: '최근업데이트', render: (v: unknown) => v ? String(v).slice(0, 16).replace('T', ' ') : '-' },
  ]

  return (
    <div>
      <PageHeader
        breadcrumb={['디바이스 관리', '디바이스 사용 생체 정보']}
        title="디바이스 사용 생체 정보"
        description="모델별 디바이스 사용 생체 정보를 조회합니다."
      />

      <div className="biometric-layout">
        {/* 모델 패널 */}
        <aside className="model-panel">
          <p className="panel-title">모델</p>
          <ul className="model-list">
            <li
              className={`model-item${selectedModelId === null ? ' active' : ''}`}
              onClick={() => setSelectedModelId(null)}
            >
              <div className="model-item-info">
                <span className="model-name">전체</span>
                <div className="model-stats">
                  <span className="stat-total">{logs.length}</span>
                  <span className="stat-sep">/</span>
                  <span className="stat-emg">{emergencyCount}</span>
                </div>
              </div>
            </li>
            {models.map((m) => (
              <li
                key={m.model_id}
                className={`model-item${selectedModelId === m.model_id ? ' active' : ''}`}
                onClick={() => setSelectedModelId(m.model_id)}
              >
                <div className="model-item-info">
                  <span className="model-name">{m.model_name}</span>
                  <div className="model-stats">
                    <span className="stat-total">{modelLogCount(m.model_id)}</span>
                    <span className="stat-sep">/</span>
                    <span className="stat-emg">{logs.filter((l) => l.model_id === m.model_id && l.emergency_id != null).length}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="panel-legend">
            <span className="legend-total">총</span>
            <span className="legend-sep">/</span>
            <span className="legend-emg">응급</span>
          </div>
        </aside>

        <div className="biometric-main">
          <SummaryCard
            items={[
              { label: '조회 데이터', value: scopedLogs.length },
              { label: '응급발생', value: scopedLogs.filter((l) => l.emergency_id != null).length, color: 'var(--danger)' },
              { label: '총걸음수', value: scopedLogs.reduce((acc, l) => acc + (l.total_steps || 0), 0).toLocaleString() },
            ]}
          />

          <ToolBar
            left={
              <input
                className="search-input"
                placeholder="사용자, 지점, 모델명, 디바이스ID 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            }
            buttons={[
              { label: '생체 데이터 등록', variant: 'primary', onClick: () => { setLogForm({ ...EMPTY_LOG_FORM }); setShowLogForm(true) } },
              { label: '응급 신고', variant: 'danger', onClick: () => setShowEmergency(true) },
              { label: '새로고침', variant: 'secondary', onClick: fetchLogs },
            ]}
          />

          <p className="table-info">총 {filtered.length}건</p>

          {loading ? (
            <div className="loading-state">데이터를 조회 중입니다...</div>
          ) : (
            <DataTable
              columns={columns as any}
              data={filtered.map((l, i) => ({ ...l, no: i + 1 })) as any}
              onRowClick={(row: any) => setDetailLog(row as DeviceLog)}
            />
          )}
        </div>
      </div>

      {/* 생체 데이터 등록 모달 */}
      {showLogForm && (
        <Modal title="생체 데이터 등록" onClose={() => setShowLogForm(false)} width="540px">
          <div className="as-form">
            <div className="form-row">
              <label className="form-label">디바이스 <span className="required">*</span></label>
              <select className="form-control" value={logForm.device_id} onChange={(e) => handleLogDeviceChange(e.target.value)}>
                <option value="">-- 디바이스 선택 --</option>
                {devices.map((d) => (
                  <option key={d.device_id} value={d.device_id}>
                    [{d.device_id}] {d.model_name} — {d.branch_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">사용자 <span className="required">*</span></label>
              <select className="form-control" value={logForm.user_id} onChange={(e) => setLogForm({ ...logForm, user_id: e.target.value })}>
                <option value="">-- 사용자 선택 --</option>
                {users.map((u) => (
                  <option key={u.user_id} value={u.user_id}>{u.user_name} ({u.email})</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">사용시간/일 (분)</label>
              <input type="number" className="form-control" min={0} placeholder="분 단위" value={logForm.usage_time_per_day} onChange={(e) => setLogForm({ ...logForm, usage_time_per_day: e.target.value })} />
            </div>
            <div className="form-row">
              <label className="form-label">총사용시간 (분)</label>
              <input type="number" className="form-control" min={0} placeholder="분 단위 누적" value={logForm.total_usage_time} onChange={(e) => setLogForm({ ...logForm, total_usage_time: e.target.value })} />
            </div>
            <div className="form-row">
              <label className="form-label">호흡수/일 (회/분)</label>
              <input type="number" className="form-control" min={0} placeholder="회/분" value={logForm.resp_rate_per_day} onChange={(e) => setLogForm({ ...logForm, resp_rate_per_day: e.target.value })} />
            </div>
            <div className="form-row">
              <label className="form-label">걸음수/일</label>
              <input type="number" className="form-control" min={0} placeholder="오늘 걸음수" value={logForm.steps_per_day} onChange={(e) => setLogForm({ ...logForm, steps_per_day: e.target.value })} />
            </div>
            <div className="form-row">
              <label className="form-label">총 걸음수</label>
              <input type="number" className="form-control" min={0} placeholder="누적 총 걸음수" value={logForm.total_steps} onChange={(e) => setLogForm({ ...logForm, total_steps: e.target.value })} />
            </div>
            <div className="form-row">
              <label className="form-label">최근 위치</label>
              <input type="text" className="form-control" placeholder="예) 서울시 강남구" value={logForm.last_location} onChange={(e) => setLogForm({ ...logForm, last_location: e.target.value })} />
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setShowLogForm(false)}>취소</button>
              <button className="btn btn-primary" onClick={handleRegisterLog} disabled={logSaving}>
                {logSaving ? '저장 중...' : '등록'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 상세 모달 */}
      {detailLog && (
        <Modal title={`생체 정보 상세 — ${detailLog.user_name || '사용자'}`} onClose={() => setDetailLog(null)} width="560px">
          <div className="biometric-detail">
            <div className="detail-section">
              <h4>기기 정보</h4>
              <div className="info-row"><span className="info-label">디바이스ID</span><span>{detailLog.device_id}</span></div>
              <div className="info-row"><span className="info-label">모델명</span><span>{detailLog.model_name || '-'}</span></div>
              <div className="info-row"><span className="info-label">지점</span><span>{detailLog.branch_name || '-'}</span></div>
              <div className="info-row"><span className="info-label">사용자</span><span>{detailLog.user_name || '-'} (ID: {detailLog.user_id})</span></div>
              <div className="info-row">
                <span className="info-label">배터리</span>
                <span>{detailLog.battery_level != null ? `${detailLog.battery_level}%` : '-'}</span>
              </div>
            </div>
            <div className="detail-section">
              <h4>생체 데이터</h4>
              <div className="info-row"><span className="info-label">최근사용일</span><span>{detailLog.last_used_date ? detailLog.last_used_date.slice(0, 10) : '-'}</span></div>
              <div className="info-row"><span className="info-label">최근사용시간</span><span>{detailLog.last_used_date ? detailLog.last_used_date.slice(11, 16) : '-'}</span></div>
              <div className="info-row"><span className="info-label">사용시간/일</span><span>{detailLog.usage_time_per_day != null ? `${detailLog.usage_time_per_day}분` : '-'}</span></div>
              <div className="info-row"><span className="info-label">총사용시간</span><span>{detailLog.total_usage_time != null ? `${(detailLog.total_usage_time / 60).toFixed(1)}h` : '-'}</span></div>
              <div className="info-row"><span className="info-label">호흡수/일</span><span>{detailLog.resp_rate_per_day != null ? `${detailLog.resp_rate_per_day}회/분` : '-'}</span></div>
              <div className="info-row"><span className="info-label">걸음수/일</span><span>{detailLog.steps_per_day != null ? detailLog.steps_per_day.toLocaleString() : '-'}</span></div>
              <div className="info-row"><span className="info-label">총 걸음수</span><span>{detailLog.total_steps != null ? detailLog.total_steps.toLocaleString() : '-'}</span></div>
              <div className="info-row"><span className="info-label">최근위치</span><span>{detailLog.last_location || '-'}</span></div>
              <div className="info-row"><span className="info-label">업데이트시각</span><span>{detailLog.created_at ? detailLog.created_at.slice(0, 16).replace('T', ' ') : '-'}</span></div>
            </div>
            {detailLog.emergency_id && (
              <div className="detail-section emergency-section">
                <h4>응급 정보</h4>
                <div className="info-row"><span className="info-label">유형</span><span>{EMERGENCY_TYPE_MAP[detailLog.type_emergency!] || '-'}</span></div>
                <div className="info-row"><span className="info-label">발생시각</span><span>{detailLog.emergency_time ? detailLog.emergency_time.slice(0, 16).replace('T', ' ') : '-'}</span></div>
                <div className="info-row"><span className="info-label">상태</span><span>{detailLog.status_emergency != null ? EMERGENCY_STATUS_MAP[detailLog.status_emergency] || '-' : '-'}</span></div>
              </div>
            )}
          </div>
        </Modal>
      )}

      <Toast {...toast} />

      {/* 응급 신고 모달 */}
      {showEmergency && (
        <Modal title="응급 신고 등록" onClose={() => setShowEmergency(false)} width="480px">
          <div className="as-form">
            <div className="form-row">
              <label className="form-label">디바이스 <span className="required">*</span></label>
              <select className="form-control" value={emgForm.device_id} onChange={(e) => handleEmgDeviceChange(e.target.value)}>
                <option value="">-- 디바이스 선택 --</option>
                {devices.filter((d) => d.device_status === 1).map((d) => (
                  <option key={d.device_id} value={d.device_id}>
                    [{d.device_id}] {d.model_name} — {d.branch_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">사용자 <span className="required">*</span></label>
              <select className="form-control" value={emgForm.user_id} onChange={(e) => setEmgForm({ ...emgForm, user_id: e.target.value })}>
                <option value="">-- 사용자 선택 --</option>
                {users.map((u) => (
                  <option key={u.user_id} value={u.user_id}>{u.user_name} ({u.email})</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">응급 유형</label>
              <select className="form-control" value={emgForm.type_emergency} onChange={(e) => setEmgForm({ ...emgForm, type_emergency: e.target.value })}>
                {Object.entries(EMERGENCY_TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">발생 위치</label>
              <input type="text" className="form-control" placeholder="위치 주소 입력" value={emgForm.location_address} onChange={(e) => setEmgForm({ ...emgForm, location_address: e.target.value })} />
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setShowEmergency(false)}>취소</button>
              <button className="btn btn-danger" onClick={handleRegisterEmergency} disabled={emgSaving}>
                {emgSaving ? '신고 중...' : '신고'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
