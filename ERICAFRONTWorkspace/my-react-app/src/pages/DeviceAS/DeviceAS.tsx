import { useState, useEffect } from 'react'
import PageHeader from '../../components/common/PageHeader'
import ToolBar from '../../components/common/ToolBar'
import DataTable from '../../components/common/DataTable'
import SummaryCard from '../../components/common/SummaryCard'
import StatusBadge from '../../components/common/StatusBadge'
import Modal from '../../components/common/Modal'
import { api } from '../../services/api'
import Toast, { useToast } from '../../components/common/Toast'
import './DeviceAS.css'

interface DeviceASData {
  as_id: number
  device_id: number
  branch_id: number
  branch_name: string
  user_id?: number
  user_name?: string
  rental_id?: number
  status_as: number
  type_as: number
  receipt_date?: string
  receipt_details?: string
  checker_name?: string
  collection_date?: string
  manager_name?: string
  repair_details?: string
  completion_date?: string
  redispatch_date?: string
  model_name: string
  created_at?: string
  dispatch_date?: string
}

interface Device {
  device_id: number
  model_name: string
  branch_name: string
  branch_id: number
}

interface UserOption {
  user_id: number
  user_name: string
  email: string
}

const AS_STATUS_MAP: Record<number, string> = {
  0: '이상무', 1: '접수', 2: '진행중', 3: '완료', 9: '취소',
}

const AS_TYPE_MAP: Record<number, string> = {
  0: '파손', 1: '침수', 2: '소프트웨어', 3: '기타', 9: '불명',
}

const today = new Date().toISOString().slice(0, 10)

const EMPTY_FORM = {
  device_id: '',
  branch_id: '',
  status_as: '1',
  type_as: '0',
  receipt_date: today,
  receipt_details: '',
  checker_name: '',
  user_id: '',
  rental_id: '',
}

export default function DeviceAS() {
  const { toast, showToast } = useToast()
  const [asItems, setAsItems] = useState<DeviceASData[]>([])
  const [branches, setBranches] = useState<{ id: number; name: string }[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [users, setUsers] = useState<UserOption[]>([])
  const [loading, setLoading] = useState(false)

  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null)

  const [statusFilter, setStatusFilter] = useState('전체')
  const [typeFilter, setTypeFilter] = useState('전체')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [search, setSearch] = useState('')

  // 신규 접수 모달
  const [showRegister, setShowRegister] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)

  // 수정 모달
  const [editTarget, setEditTarget] = useState<DeviceASData | null>(null)
  const [editStatus, setEditStatus] = useState<number>(0)
  const [editFields, setEditFields] = useState({
    manager_name: '',
    repair_details: '',
    completion_date: '',
    redispatch_date: '',
    collection_date: '',
    checker_name: '',
  })

  // 이력 모달 (디바이스별 AS 전체 이력)
  const [historyDevice, setHistoryDevice] = useState<{ id: number; name: string } | null>(null)
  const [deviceHistory, setDeviceHistory] = useState<DeviceASData[]>([])

  // 상세 모달 (접수/수리 내역)
  const [detailTarget, setDetailTarget] = useState<DeviceASData | null>(null)

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

  const buildQuery = () => {
    const params: string[] = []
    if (startDate) params.push(`start_date=${startDate}`)
    if (endDate) params.push(`end_date=${endDate}`)
    return params.length ? `?${params.join('&')}` : ''
  }

  const fetchASList = async () => {
    setLoading(true)
    try {
      const res = await api.get<DeviceASData[]>(`/as${buildQuery()}`)
      setAsItems(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDeviceHistory = async (deviceId: number) => {
    try {
      const res = await api.get<DeviceASData[]>(`/as?device_id=${deviceId}`)
      setDeviceHistory(res.data)
    } catch (err) { console.error(err) }
  }

  useEffect(() => { fetchBranches(); fetchDevices(); fetchUsers() }, [])
  useEffect(() => { fetchASList() }, [startDate, endDate])
  useEffect(() => { if (historyDevice) fetchDeviceHistory(historyDevice.id) }, [historyDevice])

  const filtered = asItems.filter((row) => {
    const matchBranch = !selectedBranchId || row.branch_id === selectedBranchId
    const matchStatus = statusFilter === '전체' || AS_STATUS_MAP[row.status_as] === statusFilter
    const matchType = typeFilter === '전체' || AS_TYPE_MAP[row.type_as] === typeFilter
    const matchSearch = !search || [row.model_name, row.manager_name, row.checker_name, row.user_name].some((v) => v?.includes(search))
    return matchBranch && matchStatus && matchType && matchSearch
  })

  const branchAsCount = (branchId: number) => asItems.filter((a) => a.branch_id === branchId).length
  const branchAsReceived = (branchId: number) => asItems.filter((a) => a.branch_id === branchId && a.status_as === 1).length
  const branchAsProgress = (branchId: number) => asItems.filter((a) => a.branch_id === branchId && a.status_as === 2).length
  const scopedItems = selectedBranchId ? asItems.filter((a) => a.branch_id === selectedBranchId) : asItems

  const handleRegister = async () => {
    if (!form.device_id || !form.branch_id || !form.user_id) {
      showToast('디바이스, 지점, 접수자는 필수입니다.', 'error')
      return
    }
    setSaving(true)
    try {
      await api.post('/as', {
        device_id: Number(form.device_id),
        branch_id: Number(form.branch_id),
        status_as: Number(form.status_as),
        type_as: Number(form.type_as),
        receipt_date: form.receipt_date ? form.receipt_date + 'T00:00:00' : null,
        receipt_details: form.receipt_details || null,
        checker_name: form.checker_name || null,
        user_id: Number(form.user_id),
        rental_id: form.rental_id ? Number(form.rental_id) : null,
      })
      setShowRegister(false)
      setForm({ ...EMPTY_FORM })
      await fetchASList()
    } catch (err: any) {
      showToast(err.message || '등록에 실패했습니다.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (row: DeviceASData) => {
    setEditTarget(row)
    setEditStatus(row.status_as)
    setEditFields({
      manager_name: row.manager_name || '',
      repair_details: row.repair_details || '',
      completion_date: row.completion_date ? row.completion_date.slice(0, 10) : '',
      redispatch_date: row.redispatch_date ? row.redispatch_date.slice(0, 10) : '',
      collection_date: row.collection_date ? row.collection_date.slice(0, 10) : '',
      checker_name: row.checker_name || '',
    })
  }

  const handleUpdate = async () => {
    if (!editTarget) return
    const receiptDate = editTarget.receipt_date ? editTarget.receipt_date.slice(0, 10) : ''
    const { collection_date, completion_date, redispatch_date } = editFields
    if (collection_date && receiptDate && collection_date < receiptDate) {
      showToast('수거일은 접수일 이후여야 합니다.', 'error')
      return
    }
    if (completion_date && collection_date && completion_date < collection_date) {
      showToast('완료일은 수거일 이후여야 합니다.', 'error')
      return
    }
    if (redispatch_date && completion_date && redispatch_date < completion_date) {
      showToast('재발송일은 완료일 이후여야 합니다.', 'error')
      return
    }
    setSaving(true)
    try {
      await api.patch(`/as/${editTarget.as_id}`, {
        status_as: editStatus,
        manager_name: editFields.manager_name || null,
        repair_details: editFields.repair_details || null,
        completion_date: editFields.completion_date ? editFields.completion_date + 'T00:00:00' : null,
        redispatch_date: editFields.redispatch_date ? editFields.redispatch_date + 'T00:00:00' : null,
        collection_date: editFields.collection_date ? editFields.collection_date + 'T00:00:00' : null,
        checker_name: editFields.checker_name || null,
      })
      setEditTarget(null)
      await fetchASList()
    } catch (err: any) {
      showToast(err.message || '수정에 실패했습니다.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { key: 'no', label: '순번', width: '50px' },
    {
      key: 'as_id', label: '이력',
      render: (_v: unknown, row: any) => (
        <button className="link-btn" onClick={(e) => {
          e.stopPropagation()
          setHistoryDevice({ id: row.device_id, name: row.model_name })
        }}>이력</button>
      ),
    },
    { key: 'status_as', label: '상태', render: (v: unknown) => <StatusBadge status={AS_STATUS_MAP[v as number] || String(v)} /> },
    { key: 'dispatch_date', label: '지점발송일', render: (v: unknown) => v ? String(v).slice(0, 10) : '-' },
    { key: 'type_as', label: '유형', render: (v: unknown) => AS_TYPE_MAP[v as number] || String(v) },
    { key: 'receipt_date', label: '접수일', render: (v: unknown) => v ? String(v).slice(0, 10) : '-' },
    { key: 'user_name', label: '접수자', render: (v: unknown) => v ? String(v) : '-' },
    { key: 'model_name', label: '모델명', render: (v: unknown) => v ? String(v) : '-' },
    { key: 'branch_name', label: '지점' },
    { key: 'checker_name', label: '확인자', render: (v: unknown) => v ? String(v) : '-' },
    { key: 'collection_date', label: '수거일', render: (v: unknown) => v ? String(v).slice(0, 10) : '-' },
    { key: 'manager_name', label: '담당자', render: (v: unknown) => v ? String(v) : '-' },
    { key: 'completion_date', label: '완료일', render: (v: unknown) => v ? String(v).slice(0, 10) : '-' },
    { key: 'redispatch_date', label: '재발송일', render: (v: unknown) => v ? String(v).slice(0, 10) : '-' },
    { key: 'device_id', label: '디바이스ID' },
    {
      key: 'receipt_details', label: '상세',
      render: (_v: unknown, row: any) => (
        <button className="link-btn" onClick={(e) => { e.stopPropagation(); setDetailTarget(row as DeviceASData) }}>
          상세
        </button>
      ),
    },
  ]

  const historyColumns = [
    { key: 'no', label: '#', width: '40px' },
    { key: 'status_as', label: '상태', render: (v: unknown) => <StatusBadge status={AS_STATUS_MAP[v as number] || String(v)} /> },
    { key: 'type_as', label: '유형', render: (v: unknown) => AS_TYPE_MAP[v as number] || String(v) },
    { key: 'receipt_date', label: '접수일', render: (v: unknown) => v ? String(v).slice(0, 10) : '-' },
    { key: 'user_name', label: '접수자', render: (v: unknown) => v ? String(v) : '-' },
    { key: 'checker_name', label: '확인자', render: (v: unknown) => v ? String(v) : '-' },
    { key: 'collection_date', label: '수거일', render: (v: unknown) => v ? String(v).slice(0, 10) : '-' },
    { key: 'manager_name', label: '담당자', render: (v: unknown) => v ? String(v) : '-' },
    { key: 'completion_date', label: '완료일', render: (v: unknown) => v ? String(v).slice(0, 10) : '-' },
    { key: 'redispatch_date', label: '재발송일', render: (v: unknown) => v ? String(v).slice(0, 10) : '-' },
  ]

  return (
    <div>
      <PageHeader
        breadcrumb={['디바이스 관리', '디바이스 AS 관리']}
        title="디바이스 AS 관리"
        description="디바이스의 AS 진행을 관리합니다."
      />

      <div className="as-layout">
        {/* 지점 패널 */}
        <aside className="as-branch-panel">
          <p className="panel-title">지점</p>
          <ul className="as-branch-list">
            <li
              className={`as-branch-item${selectedBranchId === null ? ' active' : ''}`}
              onClick={() => setSelectedBranchId(null)}
            >
              <span className="ab-name">전체</span>
              <div className="ab-stats">
                <span className="ab-total">{asItems.length}</span>
                <span className="ab-received">{asItems.filter((a) => a.status_as === 1).length}</span>
                <span className="ab-progress">{asItems.filter((a) => a.status_as === 2).length}</span>
              </div>
            </li>
            {branches.map((b) => (
              <li
                key={b.id}
                className={`as-branch-item${selectedBranchId === b.id ? ' active' : ''}`}
                onClick={() => setSelectedBranchId(b.id)}
              >
                <span className="ab-name">{b.name}</span>
                <div className="ab-stats">
                  <span className="ab-total">{branchAsCount(b.id)}</span>
                  <span className="ab-received">{branchAsReceived(b.id)}</span>
                  <span className="ab-progress">{branchAsProgress(b.id)}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="as-panel-legend">
            <span className="leg-total">전체</span>
            <span className="leg-received">접수</span>
            <span className="leg-progress">진행</span>
          </div>
        </aside>

        <div className="as-main">
          <SummaryCard
            items={[
              { label: '전체', value: scopedItems.length },
              { label: 'AS접수', value: scopedItems.filter((i) => i.status_as === 1).length, color: 'var(--warning)' },
              { label: 'AS진행', value: scopedItems.filter((i) => i.status_as === 2).length, color: 'var(--info)' },
              { label: '완료', value: scopedItems.filter((i) => i.status_as === 3).length, color: 'var(--success)' },
            ]}
          />

          <ToolBar
            left={
              <>
                <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="전체">전체 상태</option>
                  {Object.values(AS_STATUS_MAP).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="전체">전체 유형</option>
                  {Object.values(AS_TYPE_MAP).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="date" className="date-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} title="시작일" />
                <span className="date-sep">~</span>
                <input type="date" className="date-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} title="종료일" />
                <input className="search-input" placeholder="모델명, 접수자, 담당자 검색..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </>
            }
            buttons={[
              { label: 'AS 신규 접수', variant: 'primary', onClick: () => { setForm({ ...EMPTY_FORM }); setShowRegister(true) } },
            ]}
          />

          <p className="table-info">총 {filtered.length}건</p>

          {loading ? (
            <div className="loading-state">AS 데이터를 불러오는 중...</div>
          ) : (
            <DataTable
              columns={columns as any}
              data={filtered.map((item, i) => ({ ...item, no: i + 1 })) as any}
              onRowClick={(row: any) => openEdit(row as DeviceASData)}
            />
          )}
        </div>
      </div>

      {/* 신규 접수 모달 */}
      {showRegister && (
        <Modal title="AS 신규 접수" onClose={() => setShowRegister(false)} width="540px">
          <div className="as-form">
            <div className="form-row">
              <label className="form-label">디바이스 <span className="required">*</span></label>
              <select className="form-control" value={form.device_id} onChange={(e) => {
                const d = devices.find((x) => x.device_id === Number(e.target.value))
                setForm({ ...form, device_id: e.target.value, branch_id: d ? String(d.branch_id) : form.branch_id })
              }}>
                <option value="">-- 디바이스 선택 --</option>
                {devices.map((d) => (
                  <option key={d.device_id} value={d.device_id}>
                    [{d.device_id}] {d.model_name} — {d.branch_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">지점 <span className="required">*</span></label>
              <select className="form-control" value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })}>
                <option value="">-- 지점 선택 --</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">접수자 <span className="required">*</span></label>
              <select className="form-control" value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })}>
                <option value="">-- 접수자 선택 --</option>
                {users.map((u) => (
                  <option key={u.user_id} value={u.user_id}>{u.user_name} ({u.email})</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">AS 상태</label>
              <select className="form-control" value={form.status_as} onChange={(e) => setForm({ ...form, status_as: e.target.value })}>
                {Object.entries(AS_STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">AS 유형</label>
              <select className="form-control" value={form.type_as} onChange={(e) => setForm({ ...form, type_as: e.target.value })}>
                {Object.entries(AS_TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">접수일</label>
              <input type="date" className="form-control" value={form.receipt_date} onChange={(e) => setForm({ ...form, receipt_date: e.target.value })} />
            </div>
            <div className="form-row">
              <label className="form-label">접수 내용</label>
              <textarea className="form-control" rows={3} placeholder="접수 내용 입력..." value={form.receipt_details} onChange={(e) => setForm({ ...form, receipt_details: e.target.value })} />
            </div>
            <div className="form-row">
              <label className="form-label">확인자</label>
              <input type="text" className="form-control" placeholder="확인자명 입력" value={form.checker_name} onChange={(e) => setForm({ ...form, checker_name: e.target.value })} />
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setShowRegister(false)}>취소</button>
              <button className="btn btn-primary" onClick={handleRegister} disabled={saving}>
                {saving ? '저장 중...' : '접수'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 수정 모달 */}
      {editTarget && (
        <Modal title={`AS 수정 — ID: ${editTarget.as_id}`} onClose={() => setEditTarget(null)} width="560px">
          <div className="as-form">
            <div className="as-detail-info">
              <div className="info-row"><span className="info-label">디바이스</span><span>[{editTarget.device_id}] {editTarget.model_name}</span></div>
              <div className="info-row"><span className="info-label">지점</span><span>{editTarget.branch_name}</span></div>
              <div className="info-row"><span className="info-label">접수자</span><span>{editTarget.user_name || '-'}</span></div>
              <div className="info-row"><span className="info-label">접수일</span><span>{editTarget.receipt_date ? editTarget.receipt_date.slice(0, 10) : '-'}</span></div>
              <div className="info-row"><span className="info-label">접수내용</span><span>{editTarget.receipt_details || '-'}</span></div>
            </div>
            <hr style={{ margin: '12px 0' }} />
            <div className="form-row">
              <label className="form-label">AS 상태</label>
              <select className="form-control" value={editStatus} onChange={(e) => setEditStatus(Number(e.target.value))}>
                {Object.entries(AS_STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">확인자</label>
              <input type="text" className="form-control" value={editFields.checker_name} onChange={(e) => setEditFields({ ...editFields, checker_name: e.target.value })} />
            </div>
            <div className="form-row">
              <label className="form-label">수거일</label>
              <input type="date" className="form-control" value={editFields.collection_date} onChange={(e) => setEditFields({ ...editFields, collection_date: e.target.value })} />
            </div>
            <div className="form-row">
              <label className="form-label">담당자</label>
              <input type="text" className="form-control" value={editFields.manager_name} onChange={(e) => setEditFields({ ...editFields, manager_name: e.target.value })} />
            </div>
            <div className="form-row">
              <label className="form-label">수리 내용</label>
              <textarea className="form-control" rows={3} value={editFields.repair_details} onChange={(e) => setEditFields({ ...editFields, repair_details: e.target.value })} />
            </div>
            <div className="form-row">
              <label className="form-label">완료일</label>
              <input type="date" className="form-control" value={editFields.completion_date} onChange={(e) => setEditFields({ ...editFields, completion_date: e.target.value })} />
            </div>
            <div className="form-row">
              <label className="form-label">재발송일</label>
              <input type="date" className="form-control" value={editFields.redispatch_date} onChange={(e) => setEditFields({ ...editFields, redispatch_date: e.target.value })} />
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setEditTarget(null)}>취소</button>
              <button className="btn btn-primary" onClick={handleUpdate} disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 이력 모달 (디바이스별 AS 전체 이력) */}
      {historyDevice && (
        <Modal
          title={`AS 이력 — ${historyDevice.name} (디바이스 ID: ${historyDevice.id})`}
          onClose={() => setHistoryDevice(null)}
          width="860px"
        >
          {deviceHistory.length === 0 ? (
            <p className="empty-state">AS 이력이 없습니다.</p>
          ) : (
            <DataTable
              columns={historyColumns as any}
              data={deviceHistory.map((a, i) => ({ ...a, no: i + 1 })) as any}
            />
          )}
        </Modal>
      )}

      <Toast {...toast} />

      {/* 상세 모달 (접수/수리 내역) */}
      {detailTarget && (
        <Modal
          title={`AS 접수 및 수리 내역 — ID: ${detailTarget.as_id}`}
          onClose={() => setDetailTarget(null)}
          width="520px"
        >
          <div className="as-detail-view">
            <div className="detail-block">
              <h4 className="detail-block-title">접수 내역</h4>
              <p className="detail-block-body">{detailTarget.receipt_details || '(내용 없음)'}</p>
            </div>
            <div className="detail-block">
              <h4 className="detail-block-title">AS 내역 (수리 내용)</h4>
              <p className="detail-block-body">{detailTarget.repair_details || '(내용 없음)'}</p>
            </div>
            <div className="detail-meta">
              <div className="info-row"><span className="info-label">접수자</span><span>{detailTarget.user_name || '-'}</span></div>
              <div className="info-row"><span className="info-label">담당자</span><span>{detailTarget.manager_name || '-'}</span></div>
              <div className="info-row"><span className="info-label">완료일</span><span>{detailTarget.completion_date ? detailTarget.completion_date.slice(0, 10) : '-'}</span></div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
