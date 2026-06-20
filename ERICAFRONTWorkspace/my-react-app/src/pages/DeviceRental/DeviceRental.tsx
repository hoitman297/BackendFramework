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
import './DeviceRental.css'

interface Rental {
  rental_id: number
  device_id: number
  branch_id: number
  branch_name: string
  status_rent: number
  req_date: string
  exp_start_date: string
  exp_return_date: string
  receipt_date?: string
  return_date?: string
  is_worn: string
  user_id: number
  user_name: string
  model_id: number
  model_name: string
  battery_level?: number
}

interface Device {
  device_id: number
  model_name: string
  branch_id: number
  branch_name: string
  battery_level: number
  device_status: number
}

interface UserOption {
  user_id: number
  user_name: string
  email: string
}

const STATUS_MAP: Record<number, string> = {
  0: '신청', 1: '수령대기', 2: '사용중', 3: '반납완료', 9: '취소',
}

const today = new Date().toISOString().slice(0, 10)

const EMPTY_FORM = {
  device_id: '',
  branch_id: '',
  user_id: '',
  exp_start_date: today,
  exp_return_date: '',
  is_worn: 'N',
  status_rent: '0',
}

export default function DeviceRental() {
  const { toast, showToast } = useToast()
  const staff = isStaff()
  const staffBranchId = getStaffBranchId()
  const [rentals, setRentals] = useState<Rental[]>([])
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [users, setUsers] = useState<UserOption[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(staff ? staffBranchId : null)
  const [statusFilter, setStatusFilter] = useState('전체')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(new Set<number>())

  // 신규 등록 모달
  const [showRegister, setShowRegister] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)

  // 상태 수정 모달
  const [editTarget, setEditTarget] = useState<Rental | null>(null)
  const [editStatus, setEditStatus] = useState<number>(0)
  const [editReturnDate, setEditReturnDate] = useState('')
  const [editReceiptDate, setEditReceiptDate] = useState('')
  const [editIsWorn, setEditIsWorn] = useState('N')

  // 사용자 임대 이력 모달
  const [historyUser, setHistoryUser] = useState<{ id: number; name: string } | null>(null)
  const [userHistory, setUserHistory] = useState<Rental[]>([])

  const fetchBranches = async () => {
    try {
      const res = await api.get<any[]>('/branches')
      setBranches(res.data.map((b) => ({ id: b.branch_id, name: b.branch_name })))
    } catch (err) { console.error(err) }
  }

  const fetchDevices = async () => {
    try {
      const res = await api.get<Device[]>('/devices')
      setDevices(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchUsers = async () => {
    try {
      const res = await api.get<UserOption[]>('/users')
      setUsers(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchRentals = async () => {
    setLoading(true)
    try {
      const res = await api.get<Rental[]>('/rentals')
      setRentals(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserHistory = async (userId: number) => {
    try {
      const res = await api.get<Rental[]>(`/rentals/history/${userId}`)
      setUserHistory(res.data)
    } catch (err) { console.error(err) }
  }

  useEffect(() => { fetchBranches(); fetchDevices(); fetchUsers(); fetchRentals() }, [])
  useEffect(() => { if (historyUser) fetchUserHistory(historyUser.id) }, [historyUser])

  const filtered = rentals.filter((row) => {
    const matchBranch = !selectedBranchId || row.branch_id === selectedBranchId
    const matchStatus = statusFilter === '전체' || STATUS_MAP[row.status_rent] === statusFilter
    const matchSearch = !search || [row.user_name, row.model_name, String(row.device_id)].some((v) => v?.includes(search))
    return matchBranch && matchStatus && matchSearch
  })

  const branchRentalCount = (branchId: number) => rentals.filter((r) => r.branch_id === branchId).length
  const branchActiveCount = (branchId: number) => rentals.filter((r) => r.branch_id === branchId && r.status_rent === 2).length
  const scopedRentals = selectedBranchId ? rentals.filter((r) => r.branch_id === selectedBranchId) : rentals

  const handleRegister = async () => {
    if (!form.device_id || !form.user_id || !form.exp_return_date) {
      showToast('디바이스, 신청자, 반납예정일은 필수입니다.', 'error')
      return
    }
    if (!form.branch_id) {
      showToast('지점을 선택해 주세요.', 'error')
      return
    }
    if (form.exp_start_date && form.exp_return_date < form.exp_start_date) {
      showToast('반납예정일은 사용예정시작일 이후여야 합니다.', 'error')
      return
    }
    setSaving(true)
    try {
      await api.post('/rentals', {
        device_id: Number(form.device_id),
        branch_id: Number(form.branch_id) || null,
        user_id: Number(form.user_id),
        status_rent: Number(form.status_rent),
        exp_start_date: form.exp_start_date ? form.exp_start_date + 'T00:00:00' : null,
        exp_return_date: form.exp_return_date + 'T00:00:00',
        is_worn: form.is_worn,
      })
      setShowRegister(false)
      setForm({ ...EMPTY_FORM })
      await fetchRentals()
    } catch (err: any) {
      showToast(err.message || '등록에 실패했습니다.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (row: Rental) => {
    setEditTarget(row)
    setEditStatus(row.status_rent)
    setEditReturnDate(row.return_date ? row.return_date.slice(0, 10) : '')
    setEditReceiptDate(row.receipt_date ? row.receipt_date.slice(0, 10) : '')
    setEditIsWorn(row.is_worn)
  }

  const handleDelete = async () => {
    const ids = Array.from(selected).map((idx) => filtered[idx]?.rental_id).filter(Boolean)
    if (ids.length === 0) { showToast('삭제할 항목을 선택하세요.', 'error'); return }
    const activeCount = ids.filter((id) => filtered.find((r) => r.rental_id === id)?.status_rent === 2).length
    const msg = activeCount > 0
      ? `${ids.length}개 임대 이력을 삭제하시겠습니까?\n⚠️ 사용중인 임대 ${activeCount}개가 포함되어 있습니다.`
      : `${ids.length}개 임대 이력을 삭제하시겠습니까?`
    if (!confirm(msg)) return
    try {
      await Promise.all(ids.map((id) => api.delete(`/rentals/${id}`)))
      setSelected(new Set())
      await fetchRentals()
    } catch (err: any) {
      showToast(err.message || '삭제에 실패했습니다.', 'error')
    }
  }

  const handleStatusUpdate = async () => {
    if (!editTarget) return
    setSaving(true)
    try {
      await api.patch(`/rentals/${editTarget.rental_id}`, {
        status_rent: editStatus,
        return_date: editReturnDate ? editReturnDate + 'T00:00:00' : null,
        receipt_date: editReceiptDate ? editReceiptDate + 'T00:00:00' : null,
        is_worn: editIsWorn,
      })
      setEditTarget(null)
      await fetchRentals()
    } catch (err: any) {
      showToast(err.message || '수정에 실패했습니다.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const rentalColumns = [
    { key: 'no', label: '순번', width: '55px' },
    {
      key: 'status_rent', label: '상태',
      render: (v: unknown) => <StatusBadge status={STATUS_MAP[v as number] || String(v)} />,
    },
    { key: 'branch_name', label: '지점' },
    {
      key: 'user_name', label: '신청자',
      render: (v: unknown, row: any) => (
        <button className="link-btn" onClick={(e) => {
          e.stopPropagation()
          setHistoryUser({ id: row.user_id, name: String(v) })
        }}>{String(v || '-')}</button>
      ),
    },
    { key: 'user_id', label: '신청자ID' },
    { key: 'req_date', label: '신청일', render: (v: unknown) => v ? String(v).slice(0, 10) : '-' },
    { key: 'exp_start_date', label: '사용예정시작일', render: (v: unknown) => v ? String(v).slice(0, 10) : '-' },
    { key: 'exp_return_date', label: '반납예정일', render: (v: unknown) => v ? String(v).slice(0, 10) : '-' },
    { key: 'receipt_date', label: '수령일', render: (v: unknown) => v ? String(v).slice(0, 10) : '-' },
    { key: 'return_date', label: '반납일', render: (v: unknown) => v ? String(v).slice(0, 10) : '-' },
    { key: 'is_worn', label: '착용여부' },
    { key: 'device_id', label: '디바이스ID' },
    { key: 'model_name', label: '모델명' },
    {
      key: 'battery_level', label: '배터리',
      render: (v: unknown) => {
        if (v == null) return <span className="text-muted">-</span>
        const pct = Number(v)
        const cls = pct <= 20 ? 'battery-low' : pct <= 50 ? 'battery-mid' : 'battery-ok'
        return <span className={`battery-badge ${cls}`}>{pct}%</span>
      },
    },
  ]

  return (
    <div>
      <PageHeader
        breadcrumb={['디바이스 관리', '디바이스 임대 현황']}
        title="디바이스 임대 현황"
        description="지점별 디바이스 임대 현황을 관리합니다."
      />

      <div className="rental-layout">
        {/* 지점 패널 */}
        <aside className="branch-panel">
          <p className="panel-title">지점</p>
          <ul className="branch-list">
            {!staff && (
              <li
                className={`branch-item${selectedBranchId === null ? ' active' : ''}`}
                onClick={() => setSelectedBranchId(null)}
              >
                <div className="branch-item-info">
                  <span className="branch-name">전체</span>
                  <div className="branch-stats">
                    <span className="stat-item total">{rentals.length}</span>
                    <span className="stat-sep">/</span>
                    <span className="stat-item active-cnt">{rentals.filter((r) => r.status_rent === 2).length}</span>
                  </div>
                </div>
              </li>
            )}
            {branches
              .filter((b) => !staff || b.id === staffBranchId)
              .map((b) => (
                <li
                  key={b.id}
                  className={`branch-item${selectedBranchId === b.id ? ' active' : ''}`}
                  onClick={() => { if (!staff) setSelectedBranchId(b.id) }}
                  style={staff ? { cursor: 'default' } : undefined}
                >
                  <div className="branch-item-info">
                    <span className="branch-name">{b.name}</span>
                    <div className="branch-stats">
                      <span className="stat-item total">{branchRentalCount(b.id)}</span>
                      <span className="stat-sep">/</span>
                      <span className="stat-item active-cnt">{branchActiveCount(b.id)}</span>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
          <div className="panel-legend">
            <span className="legend-total">총</span>
            <span className="legend-sep">/</span>
            <span className="legend-active">사용중</span>
          </div>
        </aside>

        <div className="rental-main">
          <SummaryCard
            items={[
              { label: '총수량', value: scopedRentals.length },
              { label: '사용중', value: scopedRentals.filter((r) => r.status_rent === 2).length, color: 'var(--success)' },
              { label: '신청', value: scopedRentals.filter((r) => r.status_rent === 0).length },
              { label: '수령대기', value: scopedRentals.filter((r) => r.status_rent === 1).length, color: 'var(--warning)' },
              { label: '반납완료', value: scopedRentals.filter((r) => r.status_rent === 3).length, color: 'var(--info)' },
            ]}
          />

          <ToolBar
            left={
              <>
                <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="전체">전체 상태</option>
                  {Object.values(STATUS_MAP).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input className="search-input" placeholder="신청자, 모델명, 디바이스ID 검색..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </>
            }
            buttons={[
              { label: '신규 등록', variant: 'primary', onClick: () => { setForm({ ...EMPTY_FORM, branch_id: staff && staffBranchId ? String(staffBranchId) : '' }); setShowRegister(true) } },
              { label: '삭제', variant: 'danger', onClick: handleDelete, disabled: selected.size === 0 },
            ]}
          />

          <p className="table-info">총 {filtered.length}건{selected.size > 0 && ` / ${selected.size}건 선택됨`}</p>

          {loading ? (
            <div className="loading-state">임대 현황을 불러오는 중...</div>
          ) : (
            <DataTable
              columns={rentalColumns as any}
              data={filtered.map((r, i) => ({ ...r, no: i + 1 })) as any}
              selectedRows={selected}
              onRowClick={(row: any) => openEdit(row as Rental)}
              onSelectRow={(idx) => {
                const next = new Set(selected)
                if (next.has(idx)) next.delete(idx); else next.add(idx)
                setSelected(next)
              }}
              onSelectAll={(checked) =>
                setSelected(checked ? new Set(filtered.map((_, i) => i)) : new Set())
              }
            />
          )}
        </div>
      </div>

      {/* 신규 등록 모달 */}
      {showRegister && (
        <Modal title="임대 신규 등록" onClose={() => setShowRegister(false)} width="540px">
          <div className="rental-form">
            <div className="form-row">
              <label className="form-label">디바이스 <span className="required">*</span></label>
              <select className="form-control" value={form.device_id} onChange={(e) => {
                const d = devices.find((x) => x.device_id === Number(e.target.value))
                setForm({ ...form, device_id: e.target.value, branch_id: d ? String(d.branch_id ?? '') : form.branch_id })
              }}>
                <option value="">-- 디바이스 선택 --</option>
                {devices
                  .filter((d) => (d.device_status === 0 || d.device_status === 4) && (!staff || d.branch_id === staffBranchId))
                  .map((d) => (
                    <option key={d.device_id} value={d.device_id}>
                      [{d.device_id}] {d.model_name} — {d.branch_name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">지점 <span className="required">*</span></label>
              <select className="form-control" value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })} disabled={staff}>
                <option value="">-- 지점 선택 --</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">신청자 <span className="required">*</span></label>
              <select className="form-control" value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })}>
                <option value="">-- 신청자 선택 --</option>
                {users.map((u) => (
                  <option key={u.user_id} value={u.user_id}>{u.user_name} ({u.email})</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">임대 상태</label>
              <select className="form-control" value={form.status_rent} onChange={(e) => setForm({ ...form, status_rent: e.target.value })}>
                {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">사용예정시작일</label>
              <input type="date" className="form-control" value={form.exp_start_date} onChange={(e) => setForm({ ...form, exp_start_date: e.target.value })} />
            </div>
            <div className="form-row">
              <label className="form-label">반납예정일 <span className="required">*</span></label>
              <input type="date" className="form-control" value={form.exp_return_date} onChange={(e) => setForm({ ...form, exp_return_date: e.target.value })} />
            </div>
            <div className="form-row">
              <label className="form-label">착용여부</label>
              <select className="form-control" value={form.is_worn} onChange={(e) => setForm({ ...form, is_worn: e.target.value })}>
                <option value="N">N (미착용)</option>
                <option value="Y">Y (착용)</option>
              </select>
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setShowRegister(false)}>취소</button>
              <button className="btn btn-primary" onClick={handleRegister} disabled={saving}>
                {saving ? '저장 중...' : '등록'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 상태 수정 모달 */}
      {editTarget && (
        <Modal title={`임대 수정 — ID: ${editTarget.rental_id}`} onClose={() => setEditTarget(null)} width="480px">
          <div className="rental-form">
            <div className="info-row">
              <span className="info-label">신청자</span>
              <span>{editTarget.user_name || '-'} (ID: {editTarget.user_id})</span>
            </div>
            <div className="info-row">
              <span className="info-label">디바이스</span>
              <span>[{editTarget.device_id}] {editTarget.model_name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">지점</span>
              <span>{editTarget.branch_name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">신청일</span>
              <span>{editTarget.req_date ? editTarget.req_date.slice(0, 10) : '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">반납예정일</span>
              <span>{editTarget.exp_return_date ? editTarget.exp_return_date.slice(0, 10) : '-'}</span>
            </div>
            <hr style={{ margin: '12px 0' }} />
            <div className="form-row">
              <label className="form-label">상태 변경</label>
              <select className="form-control" value={editStatus} onChange={(e) => setEditStatus(Number(e.target.value))}>
                {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">수령일</label>
              <input type="date" className="form-control" value={editReceiptDate} onChange={(e) => setEditReceiptDate(e.target.value)} />
            </div>
            <div className="form-row">
              <label className="form-label">반납일</label>
              <input type="date" className="form-control" value={editReturnDate} onChange={(e) => setEditReturnDate(e.target.value)} />
            </div>
            <div className="form-row">
              <label className="form-label">착용여부</label>
              <select className="form-control" value={editIsWorn} onChange={(e) => setEditIsWorn(e.target.value)}>
                <option value="N">N (미착용)</option>
                <option value="Y">Y (착용)</option>
              </select>
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setEditTarget(null)}>취소</button>
              <button className="btn btn-primary" onClick={handleStatusUpdate} disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Toast {...toast} />

      {/* 사용자 임대 이력 모달 */}
      {historyUser && (
        <Modal title={`${historyUser.name} > 임대이력`} onClose={() => setHistoryUser(null)} width="900px">
          <DataTable
            columns={rentalColumns as any}
            data={userHistory.map((r, i) => ({ ...r, no: i + 1 })) as any}
          />
        </Modal>
      )}
    </div>
  )
}
