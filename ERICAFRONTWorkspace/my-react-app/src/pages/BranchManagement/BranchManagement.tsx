import { useState, useEffect } from 'react'
import PageHeader from '../../components/common/PageHeader'
import ToolBar from '../../components/common/ToolBar'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import Modal from '../../components/common/Modal'
import { api } from '../../services/api'
import './BranchManagement.css'

interface Branch {
  branch_id: number;
  branch_name: string;
  branch_short_name?: string;
  status_center: string;
  phone?: string;
  address: string;
  detail_address?: string;
  manager_name?: string;
  fax?: string;
  sort_order?: number;
}

interface Manager {
  manager_id: number;
  manager_name: string;
  phone: string;
  email: string;
  rank_name?: string;
  work_status: string;
  department?: string;
  team?: string;
}

const EMPTY_FORM = {
  branch_name: '',
  branch_short_name: '',
  status_center: '운영',
  address: '',
  detail_address: '',
  manager_name: '',
  phone: '',
  fax: '',
  sort_order: 1,
}

const branchColumns = [
  { key: 'no', label: '순번', width: '55px' },
  { key: 'status_center', label: '상태', render: (v: unknown) => <StatusBadge status={String(v)} /> },
  { key: 'branch_name', label: '지점' },
  { key: 'branch_short_name', label: '약칭', render: (v: unknown) => v ? String(v) : '-' },
  { key: 'manager_name', label: '지점장명', render: (v: unknown) => v ? String(v) : '-' },
  { key: 'address', label: '주소', render: (v: unknown) => v ? String(v) : '-' },
  { key: 'phone', label: '대표전화번호', render: (v: unknown) => v ? String(v) : '-' },
  { key: 'fax', label: '대표팩스번호', render: (v: unknown) => v ? String(v) : '-' },
]

const managerColumns = [
  { key: 'no', label: '순번', width: '55px' },
  { key: 'manager_name', label: '담당자명' },
  { key: 'department', label: '부서', render: (v: unknown) => v ? String(v) : '-' },
  { key: 'team', label: '팀', render: (v: unknown) => v ? String(v) : '-' },
  { key: 'rank_name', label: '직급', render: (v: unknown) => v ? String(v) : '-' },
  { key: 'phone', label: '연락처', render: (v: unknown) => v ? String(v) : '-' },
  { key: 'email', label: '이메일' },
  { key: 'work_status', label: '재직상태', render: (v: unknown) => <StatusBadge status={String(v || '재직')} /> },
]

export default function BranchManagement() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(new Set<number>())
  const [showManagerBranchId, setShowManagerBranchId] = useState<{id: number, name: string} | null>(null)
  const [statusFilter, setStatusFilter] = useState('전체')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editBranch, setEditBranch] = useState<Branch | null>(null)
  const [formData, setFormData] = useState(EMPTY_FORM)

  const fetchBranches = async () => {
    setLoading(true)
    try {
      const param = statusFilter === '전체' ? '' : `status_center=${statusFilter}`
      const res = await api.get<Branch[]>(`/branches${param ? '?' + param : ''}`)
      setBranches(res.data)
    } catch (err) {
      console.error(err)
      alert('지점 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const fetchManagers = async (branchId: number) => {
    try {
      const res = await api.get<Manager[]>(`/managers?branch_id=${branchId}`)
      setManagers(res.data)
    } catch (err) {
      console.error(err)
      alert('담당자 목록을 불러오는데 실패했습니다.')
    }
  }

  useEffect(() => { fetchBranches() }, [statusFilter])

  useEffect(() => {
    if (showManagerBranchId) fetchManagers(showManagerBranchId.id)
  }, [showManagerBranchId])

  const filtered = branches.filter((row) =>
    !search || [row.branch_name, row.manager_name, row.address].some((v) => v?.includes(search))
  )
  const dataWithNo = filtered.map((b, i) => ({ ...b, no: i + 1 }))

  const openCreate = () => {
    setEditBranch(null)
    setFormData(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = () => {
    if (selected.size !== 1) return alert('수정할 항목을 1개만 선택해 주세요.')
    const idx = [...selected][0]
    const branch = filtered[idx]
    if (!branch) return
    setEditBranch(branch)
    setFormData({
      branch_name: branch.branch_name,
      branch_short_name: branch.branch_short_name || '',
      status_center: branch.status_center,
      address: branch.address || '',
      detail_address: branch.detail_address || '',
      manager_name: branch.manager_name || '',
      phone: branch.phone || '',
      fax: branch.fax || '',
      sort_order: branch.sort_order ?? 1,
    })
    setShowForm(true)
  }

  const saveForm = async () => {
    if (!formData.branch_name.trim()) return alert('지점명을 입력해 주세요.')
    try {
      if (editBranch) {
        await api.patch(`/branches/${editBranch.branch_id}`, formData)
        alert('수정되었습니다.')
      } else {
        await api.post('/branches', formData)
        alert('등록되었습니다.')
      }
      setShowForm(false)
      setSelected(new Set())
      fetchBranches()
    } catch (err) {
      console.error(err)
      alert('저장 실패')
    }
  }

  const handleDelete = async () => {
    if (selected.size === 0) return
    if (!confirm(`선택한 ${selected.size}개 지점을 삭제하시겠습니까?`)) return
    try {
      const toDelete = [...selected].map(idx => filtered[idx]).filter(Boolean)
      await Promise.all(toDelete.map(b => api.delete(`/branches/${b.branch_id}`)))
      alert('삭제되었습니다.')
      setSelected(new Set())
      fetchBranches()
    } catch (err) {
      console.error(err)
      alert('삭제 실패')
    }
  }

  const handleField = (key: string, value: string | number) =>
    setFormData(prev => ({ ...prev, [key]: value }))

  const renderColumns = branchColumns.map((col) =>
    col.key === 'branch_name'
      ? { ...col, render: (_v: unknown, row: Record<string, unknown>) => (
          <button className="link-btn" onClick={(e) => {
            e.stopPropagation()
            setShowManagerBranchId({id: Number(row.branch_id), name: String(row.branch_name)})
          }}>
            {String(row.branch_name || '')}
          </button>
        )}
      : col
  )

  return (
    <div>
      <PageHeader
        breadcrumb={['지점/센터', '지점 관리']}
        title="지점 관리"
        description="디바이스 임대관리 지점을 관리합니다."
      />

      <ToolBar
        left={
          <>
            <select className="filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setSelected(new Set()) }}>
              {['전체', '운영', '폐쇄', '준비'].map((s) => <option key={s}>{s}</option>)}
            </select>
            <input
              className="search-input"
              placeholder="지점명, 담당자, 주소 검색..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelected(new Set()) }}
            />
          </>
        }
        buttons={[
          { label: '신규', variant: 'primary', onClick: openCreate },
          { label: '저장', variant: 'secondary', onClick: openEdit, disabled: selected.size !== 1 },
          { label: '삭제', variant: 'danger', onClick: handleDelete, disabled: selected.size === 0 },
        ]}
      />

      {loading ? (
        <div className="loading-state">데이터를 불러오는 중...</div>
      ) : (
        <DataTable
          columns={renderColumns as Parameters<typeof DataTable>[0]['columns']}
          data={dataWithNo as Record<string, unknown>[]}
          selectedRows={selected}
          onSelectRow={(idx) => {
            const next = new Set(selected)
            if (next.has(idx)) next.delete(idx)
            else next.add(idx)
            setSelected(next)
          }}
          onSelectAll={(checked) =>
            setSelected(checked ? new Set(dataWithNo.map((_, i) => i)) : new Set())
          }
        />
      )}
      <p className="table-info">총 {filtered.length}건</p>

      {showManagerBranchId && (
        <Modal title={`${showManagerBranchId.name} > 담당자 현황`} onClose={() => setShowManagerBranchId(null)} width="700px">
          <DataTable
            columns={managerColumns as Parameters<typeof DataTable>[0]['columns']}
            data={managers.map((m, i) => ({ ...m, no: i + 1 })) as Record<string, unknown>[]}
          />
        </Modal>
      )}

      {showForm && (
        <Modal title={editBranch ? '지점 수정' : '지점 신규 등록'} onClose={() => setShowForm(false)} width="520px">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">지점명 <span style={{color:'red'}}>*</span></label>
              <input className="form-input" value={formData.branch_name} onChange={e => handleField('branch_name', e.target.value)} />
            </div>
            <div>
              <label className="form-label">약칭</label>
              <input className="form-input" value={formData.branch_short_name} onChange={e => handleField('branch_short_name', e.target.value)} />
            </div>
            <div>
              <label className="form-label">상태</label>
              <select className="form-input" value={formData.status_center} onChange={e => handleField('status_center', e.target.value)}>
                {['운영', '폐쇄', '준비'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">지점장명</label>
              <input className="form-input" value={formData.manager_name} onChange={e => handleField('manager_name', e.target.value)} />
            </div>
            <div>
              <label className="form-label">전화번호</label>
              <input className="form-input" value={formData.phone} onChange={e => handleField('phone', e.target.value)} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">주소</label>
              <input className="form-input" value={formData.address} onChange={e => handleField('address', e.target.value)} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">상세주소</label>
              <input className="form-input" value={formData.detail_address} onChange={e => handleField('detail_address', e.target.value)} />
            </div>
            <div>
              <label className="form-label">팩스번호</label>
              <input className="form-input" value={formData.fax} onChange={e => handleField('fax', e.target.value)} />
            </div>
            <div>
              <label className="form-label">정렬순서</label>
              <input className="form-input" type="number" value={formData.sort_order} onChange={e => handleField('sort_order', Number(e.target.value))} />
            </div>
          </div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>취소</button>
            <button className="btn btn-primary" onClick={saveForm}>저장</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
