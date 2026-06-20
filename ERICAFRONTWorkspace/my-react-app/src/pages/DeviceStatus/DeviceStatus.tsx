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
import './DeviceStatus.css'

interface Device {
  device_id: number
  model_id: number
  model_name: string
  model_version?: string
  manual_url?: string
  branch_id: number
  branch_name: string
  device_status: number
  battery_level: number
  receive_date?: string
  dispatch_date?: string
  last_rental_date?: string
  last_as_date?: string
  device_specs?: string
  model_specs?: string
  user_id: number
  created_at?: string
}

interface DeviceModel {
  model_id: number
  model_name: string
  version?: string
  manual_url?: string
}

interface UserOption {
  user_id: number
  user_name: string
  email: string
}

interface AsRecord {
  as_id: number
  device_id: number
  branch_name: string
  status_as: number
  type_as: number
  receipt_date?: string
  receipt_details?: string
  checker_name?: string
  manager_name?: string
  repair_details?: string
  completion_date?: string
}

const STATUS_MAP: Record<number, string> = {
  0: '입고', 1: '임대중', 3: 'AS접수', 4: 'AS완료', 9: '폐기',
}
const AS_STATUS_MAP: Record<number, string> = {
  0: '이상무', 1: '접수', 2: '진행중', 3: '완료', 4: '폐기', 9: '취소',
}
const AS_TYPE_MAP: Record<number, string> = {
  0: '파손', 1: '침수', 2: '소프트웨어', 3: '기타', 9: '불명',
}

const today = new Date().toISOString().slice(0, 10)

const EMPTY_FORM = {
  model_id: '',
  branch_id: '',
  device_status: '0',
  battery_level: '100',
  receive_date: today,
  dispatch_date: '',
  device_specs: '',
  user_id: '',
}

export default function DeviceStatus() {
  const { toast, showToast } = useToast()
  const staff = isStaff()
  const staffBranchId = getStaffBranchId()
  const [devices, setDevices] = useState<Device[]>([])
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([])
  const [models, setModels] = useState<DeviceModel[]>([])
  const [users, setUsers] = useState<UserOption[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(staff ? staffBranchId : null)
  const [statusFilter, setStatusFilter] = useState('전체')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(new Set<number>())

  // 신규/수정 모달
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null)
  const [editTarget, setEditTarget] = useState<Device | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)

  // AS 이력 모달
  const [asTarget, setAsTarget] = useState<Device | null>(null)
  const [asHistory, setAsHistory] = useState<AsRecord[]>([])
  const [asLoading, setAsLoading] = useState(false)

  // 모델 정보 모달
  const [modelTarget, setModelTarget] = useState<Device | null>(null)

  const fetchBranches = async () => {
    try {
      const res = await api.get<any[]>('/branches')
      setBranches(res.data.map((b) => ({ id: b.branch_id, name: b.branch_name })))
    } catch (err) { console.error(err) }
  }

  const fetchModels = async () => {
    try {
      const res = await api.get<DeviceModel[]>('/device-models')
      setModels(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchUsers = async () => {
    try {
      const res = await api.get<UserOption[]>('/users')
      setUsers(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchDevices = async () => {
    setLoading(true)
    try {
      const res = await api.get<Device[]>('/devices')
      setDevices(res.data)
    } catch (err) {
      console.error(err)
      showToast('디바이스 목록을 불러오는데 실패했습니다.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBranches()
    fetchModels()
    fetchUsers()
    fetchDevices()
  }, [])

  const filtered = devices.filter((row) => {
    const statusText = STATUS_MAP[row.device_status] || ''
    const matchStatus = statusFilter === '전체' || statusText === statusFilter
    const matchBranch =
      selectedBranchId === null ? true
      : selectedBranchId === -1 ? !row.dispatch_date
      : row.branch_id === selectedBranchId
    const matchSearch =
      !search ||
      [row.model_name, row.branch_name, String(row.device_id)].some((v) =>
        v?.toLowerCase().includes(search.toLowerCase())
      )
    return matchStatus && matchBranch && matchSearch
  })

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, branch_id: staff && staffBranchId ? String(staffBranchId) : '' })
    setEditTarget(null)
    setFormMode('create')
  }

  const openEdit = (row: Device) => {
    setForm({
      model_id: String(row.model_id),
      branch_id: String(row.branch_id),
      device_status: String(row.device_status),
      battery_level: String(row.battery_level),
      receive_date: row.receive_date ? row.receive_date.slice(0, 10) : '',
      dispatch_date: row.dispatch_date ? row.dispatch_date.slice(0, 10) : '',
      device_specs: row.device_specs || '',
      user_id: String(row.user_id),
    })
    setEditTarget(row)
    setFormMode('edit')
  }

  const handleSave = async () => {
    if (!form.model_id || !form.branch_id || !form.user_id) {
      showToast('모델, 지점, 담당자는 필수입니다.', 'error')
      return
    }
    const battery = Number(form.battery_level)
    if (isNaN(battery) || battery < 0 || battery > 100) {
      showToast('배터리는 0~100 사이의 값이어야 합니다.', 'error')
      return
    }
    if (form.dispatch_date && form.receive_date && form.dispatch_date < form.receive_date) {
      showToast('지점발송일은 입고일 이후여야 합니다.', 'error')
      return
    }
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        model_id: Number(form.model_id),
        branch_id: Number(form.branch_id),
        device_status: Number(form.device_status),
        battery_level: Number(form.battery_level),
        receive_date: form.receive_date ? form.receive_date + 'T00:00:00' : null,
        dispatch_date: form.dispatch_date ? form.dispatch_date + 'T00:00:00' : null,
        device_specs: form.device_specs || null,
        user_id: Number(form.user_id),
      }
      if (formMode === 'create') {
        await api.post('/devices', body)
      } else if (editTarget) {
        await api.patch(`/devices/${editTarget.device_id}`, body)
      }
      setFormMode(null)
      setSelected(new Set())
      await fetchDevices()
    } catch (err: any) {
      showToast(err.message || '저장에 실패했습니다.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const ids = Array.from(selected).map((idx) => filtered[idx]?.device_id).filter(Boolean)
    if (ids.length === 0) { showToast('삭제할 항목을 선택하세요.', 'error'); return }
    const rentingCount = ids.filter((id) => filtered.find((d) => d.device_id === id)?.device_status === 1).length
    const msg = rentingCount > 0
      ? `${ids.length}개 디바이스를 삭제하시겠습니까?\n⚠️ 임대중인 디바이스 ${rentingCount}개가 포함되어 있습니다.`
      : `${ids.length}개 디바이스를 삭제하시겠습니까?`
    if (!confirm(msg)) return
    try {
      await Promise.all(ids.map((id) => api.delete(`/devices/${id}`)))
      setSelected(new Set())
      await fetchDevices()
    } catch (err: any) {
      showToast(err.message || '삭제에 실패했습니다.', 'error')
    }
  }

  const openAsHistory = async (row: Device) => {
    setAsTarget(row)
    setAsHistory([])
    setAsLoading(true)
    try {
      const res = await api.get<AsRecord[]>(`/as?device_id=${row.device_id}`)
      setAsHistory(res.data)
    } catch (err) { console.error(err) } finally { setAsLoading(false) }
  }

  const undispatchedCount = devices.filter((d) => !d.dispatch_date).length

  const columns = [
    { key: 'no', label: '순번', width: '55px' },
    {
      key: 'device_status',
      label: '상태',
      render: (v: unknown) => <StatusBadge status={STATUS_MAP[v as number] || String(v)} />,
    },
    { key: 'branch_name', label: '지점' },
    { key: 'dispatch_date', label: '지점발송일', render: (v: unknown) => v ? String(v).slice(0, 10) : '-' },
    { key: 'device_id', label: '디바이스ID' },
    {
      key: 'model_name',
      label: '모델명',
      render: (v: unknown, row: any) => (
        <button
          className="link-btn"
          onClick={(e) => { e.stopPropagation(); setModelTarget(row as Device) }}
        >
          {String(v)}
        </button>
      ),
    },
    {
      key: 'battery_level',
      label: '배터리',
      render: (v: unknown) => {
        const pct = Number(v)
        const cls = pct <= 20 ? 'battery-low' : pct <= 50 ? 'battery-mid' : 'battery-ok'
        return <span className={`battery-badge ${cls}`}>{pct}%</span>
      },
    },
    { key: 'last_rental_date', label: '최근 임대일', render: (v: unknown) => v ? String(v).slice(0, 10) : '-' },
    {
      key: 'last_as_date',
      label: '최근 AS',
      render: (v: unknown, row: any) => (
        <button
          className="link-btn"
          onClick={(e) => { e.stopPropagation(); openAsHistory(row as Device) }}
        >
          {v ? String(v).slice(0, 10) : '이력없음'}
        </button>
      ),
    },
    { key: 'receive_date', label: '입고일', render: (v: unknown) => v ? String(v).slice(0, 10) : '-' },
    { key: 'device_specs', label: '비고', render: (v: unknown) => v ? String(v) : '-' },
  ]

  const dataWithNo = filtered.map((d, i) => ({ ...d, no: i + 1 }))

  return (
    <div>
      <PageHeader
        breadcrumb={['디바이스 관리', '디바이스 현황']}
        title="디바이스 현황"
        description="지점별 디바이스를 관리합니다."
      />

      <div className="device-status-layout">
        {/* 지점 패널 */}
        <aside className="branch-panel">
          <p className="panel-title">지점</p>
          <div className="branch-panel-header">
            <span className="branch-col-label">지점</span>
            <span className="branch-col-label">수량</span>
            <span className="branch-col-label">출고</span>
            <span className="branch-col-label">폐기</span>
          </div>
          <ul className="branch-list">
            {!staff && (
              <>
                <li
                  className={`branch-item${selectedBranchId === null ? ' active' : ''}`}
                  onClick={() => { setSelectedBranchId(null); setSelected(new Set()) }}
                >
                  <span className="branch-name-cell">전체</span>
                  <span className="branch-count">{devices.length}</span>
                  <span className="branch-count">{devices.filter((d) => d.dispatch_date).length}</span>
                  <span className="branch-count">{devices.filter((d) => d.device_status === 9).length}</span>
                </li>
                <li
                  className={`branch-item${selectedBranchId === -1 ? ' active' : ''}`}
                  onClick={() => { setSelectedBranchId(-1); setSelected(new Set()) }}
                >
                  <span className="branch-name-cell">미발송</span>
                  <span className="branch-count">{undispatchedCount}</span>
                  <span className="branch-count">0</span>
                  <span className="branch-count">-</span>
                </li>
              </>
            )}
            {branches
              .filter((b) => !staff || b.id === staffBranchId)
              .map((b) => {
                const branchDevs = devices.filter((d) => d.branch_id === b.id)
                return (
                  <li
                    key={b.id}
                    className={`branch-item${selectedBranchId === b.id ? ' active' : ''}`}
                    onClick={() => { if (!staff) { setSelectedBranchId(b.id); setSelected(new Set()) } }}
                    style={staff ? { cursor: 'default' } : undefined}
                  >
                    <span className="branch-name-cell">{b.name}</span>
                    <span className="branch-count">{branchDevs.length}</span>
                    <span className="branch-count">{branchDevs.filter((d) => d.dispatch_date).length}</span>
                    <span className="branch-count">{branchDevs.filter((d) => d.device_status === 9).length}</span>
                  </li>
                )
              })}
          </ul>
        </aside>

        <div className="device-main">
          {/* 요약 카드 */}
          <SummaryCard
            items={[
              { label: '전체', value: devices.length },
              { label: '입고', value: devices.filter((d) => d.device_status === 0).length },
              { label: '임대중', value: devices.filter((d) => d.device_status === 1).length, color: 'var(--success)' },
              { label: 'AS접수', value: devices.filter((d) => d.device_status === 3).length, color: '#8b5cf6' },
              { label: 'AS완료', value: devices.filter((d) => d.device_status === 4).length, color: 'var(--info)' },
              { label: '폐기', value: devices.filter((d) => d.device_status === 9).length, color: 'var(--danger)' },
            ]}
          />

          {/* 툴바 */}
          <ToolBar
            left={
              <>
                <select
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setSelected(new Set()) }}
                >
                  {['전체', '입고', '임대중', 'AS접수', 'AS완료', '폐기'].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <input
                  className="search-input"
                  placeholder="모델명, 지점명, 디바이스ID 검색..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setSelected(new Set()) }}
                />
              </>
            }
            buttons={[
              { label: '신규 등록', variant: 'primary', onClick: openCreate },
              { label: '삭제', variant: 'danger', onClick: handleDelete, disabled: selected.size === 0 },
            ]}
          />

          <p className="table-info">총 {filtered.length}건{selected.size > 0 && ` / ${selected.size}건 선택됨`}</p>

          {loading ? (
            <div className="loading-state">디바이스 정보를 불러오는 중...</div>
          ) : (
            <DataTable
              columns={columns as any}
              data={dataWithNo as any}
              selectedRows={selected}
              onRowClick={(row) => openEdit(row as unknown as Device)}
              onSelectRow={(idx) => {
                const next = new Set(selected)
                if (next.has(idx)) next.delete(idx)
                else next.add(idx)
                setSelected(next)
              }}
              onSelectAll={(checked) => {
                setSelected(checked ? new Set(dataWithNo.map((_, i) => i)) : new Set())
              }}
            />
          )}
        </div>
      </div>

      {/* ── 신규/수정 모달 ── */}
      {formMode && (
        <Modal
          title={formMode === 'create' ? '디바이스 신규 등록' : `디바이스 수정 (ID: ${editTarget?.device_id})`}
          onClose={() => setFormMode(null)}
          width="540px"
        >
          <div className="device-form">
            <div className="form-row">
              <label className="form-label">모델 <span className="required">*</span></label>
              <select
                className="form-control"
                value={form.model_id}
                onChange={(e) => setForm({ ...form, model_id: e.target.value })}
              >
                <option value="">-- 모델 선택 --</option>
                {models.map((m) => (
                  <option key={m.model_id} value={m.model_id}>
                    {m.model_name}{m.version ? ` (v${m.version})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label className="form-label">지점 <span className="required">*</span></label>
              <select
                className="form-control"
                value={form.branch_id}
                onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                disabled={staff}
              >
                <option value="">-- 지점 선택 --</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label className="form-label">담당자 <span className="required">*</span></label>
              <select
                className="form-control"
                value={form.user_id}
                onChange={(e) => setForm({ ...form, user_id: e.target.value })}
              >
                <option value="">-- 담당자 선택 --</option>
                {users.map((u) => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.user_name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label className="form-label">기기 상태</label>
              <select
                className="form-control"
                value={form.device_status}
                onChange={(e) => setForm({ ...form, device_status: e.target.value })}
              >
                {Object.entries(STATUS_MAP).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label className="form-label">배터리 (%)</label>
              <input
                type="number"
                className="form-control"
                min={0}
                max={100}
                value={form.battery_level}
                onChange={(e) => setForm({ ...form, battery_level: e.target.value })}
              />
            </div>

            <div className="form-row">
              <label className="form-label">입고일</label>
              <input
                type="date"
                className="form-control"
                value={form.receive_date}
                onChange={(e) => setForm({ ...form, receive_date: e.target.value })}
              />
            </div>

            <div className="form-row">
              <label className="form-label">지점발송일</label>
              <input
                type="date"
                className="form-control"
                value={form.dispatch_date}
                onChange={(e) => setForm({ ...form, dispatch_date: e.target.value })}
              />
            </div>

            <div className="form-row">
              <label className="form-label">상세 스펙 / 비고</label>
              <textarea
                className="form-control"
                rows={3}
                value={form.device_specs}
                onChange={(e) => setForm({ ...form, device_specs: e.target.value })}
                placeholder="디바이스 상세 스펙 또는 메모 입력..."
              />
            </div>

            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setFormMode(null)}>취소</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── AS 이력 모달 ── */}
      {asTarget && (
        <Modal
          title={`AS 이력 — ${asTarget.model_name} (ID: ${asTarget.device_id})`}
          onClose={() => setAsTarget(null)}
          width="860px"
        >
          {asLoading ? (
            <p className="loading-state">AS 이력을 불러오는 중...</p>
          ) : asHistory.length === 0 ? (
            <p className="empty-state">AS 이력이 없습니다.</p>
          ) : (
            <DataTable
              columns={[
                { key: 'no', label: '#', width: '45px' },
                { key: 'status_as', label: '상태', render: (v) => <StatusBadge status={AS_STATUS_MAP[v as number] || String(v)} /> },
                { key: 'type_as', label: '유형', render: (v) => AS_TYPE_MAP[v as number] || String(v) },
                { key: 'user_name', label: '접수자', render: (v) => v ? String(v) : '-' },
                { key: 'receipt_date', label: '접수일', render: (v) => v ? String(v).slice(0, 10) : '-' },
                { key: 'receipt_details', label: '접수내역', render: (v) => v ? String(v) : '-' },
                { key: 'checker_name', label: '확인자', render: (v) => v ? String(v) : '-' },
                { key: 'manager_name', label: '담당자', render: (v) => v ? String(v) : '-' },
                { key: 'repair_details', label: '수리내역', render: (v) => v ? String(v) : '-' },
                { key: 'completion_date', label: '수리완료일', render: (v) => v ? String(v).slice(0, 10) : '-' },
              ]}
              data={asHistory.map((a, i) => ({ ...a, no: i + 1 }))}
            />
          )}
        </Modal>
      )}

      <Toast {...toast} />

      {/* ── 모델 정보 모달 ── */}
      {modelTarget && (
        <Modal
          title={`모델 정보 — ${modelTarget.model_name}`}
          onClose={() => setModelTarget(null)}
          width="480px"
        >
          <div className="model-info-content">
            <div className="info-row">
              <span className="info-label">모델명</span>
              <span>{modelTarget.model_name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">버전</span>
              <span>{modelTarget.model_version || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">상세 스펙</span>
              <span>{modelTarget.model_specs || '정보 없음'}</span>
            </div>
            {modelTarget.manual_url && (
              <div className="form-actions" style={{ marginTop: '16px' }}>
                <a
                  href={modelTarget.manual_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                >
                  메뉴얼 다운로드
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
