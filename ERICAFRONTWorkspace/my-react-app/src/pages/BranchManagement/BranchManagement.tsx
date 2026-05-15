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
  status_center: string;
  main_phone: string;
  address: string;
  detail_address?: string;
  director_name: string;
  fax_number?: string;
  // API 응답에는 포함되지 않았으나 UI에서 사용하는 주담당자 정보 (조인 처리 가정)
  manager_name?: string;
  manager_phone?: string;
}

interface Manager {
  manager_id: number;
  name: string;
  contact: string;
  email: string;
  is_main: string;
  status: string;
}

const branchColumns = [
  { key: 'no', label: '순번', width: '55px' },
  { key: 'status_center', label: '상태', render: (v: unknown) => <StatusBadge status={String(v)} /> },
  { key: 'branch_name', label: '지점' },
  { key: 'manager_name', label: '주담당자' },
  { key: 'manager_phone', label: '주담당자연락처' },
  { key: 'address', label: '주소' },
  { key: 'director_name', label: '지점장명' },
  { key: 'main_phone', label: '대표전화번호' },
  { key: 'fax_number', label: '대표팩스번호' },
]

const managerColumns = [
  { key: 'no', label: '순번', width: '55px' },
  { key: 'name', label: '담당자명' },
  { key: 'contact', label: '연락처' },
  { key: 'email', label: '이메일' },
  { key: 'is_main', label: '주/부', width: '60px', render: (v: unknown) => v === 'Y' ? '주' : '부' },
  { key: 'status', label: '상태', render: (v: unknown) => <StatusBadge status={String(v)} /> },
]

export default function BranchManagement() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(new Set<number>())
  const [showManagerBranchId, setShowManagerBranchId] = useState<{id: number, name: string} | null>(null)
  const [statusFilter, setStatusFilter] = useState('전체')
  const [search, setSearch] = useState('')

  // 지점 목록 조회
  const fetchBranches = async () => {
    setLoading(true)
    try {
      const res = await api.get<Branch[]>(`/branches?status_center=${statusFilter === '전체' ? '' : statusFilter}`)
      setBranches(res.data)
    } catch (err) {
      console.error(err)
      alert('지점 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 담당자 목록 조회
  const fetchManagers = async (branchId: number) => {
    try {
      const res = await api.get<Manager[]>(`/managers?branch_id=${branchId}`)
      setManagers(res.data)
    } catch (err) {
      console.error(err)
      alert('담당자 목록을 불러오는데 실패했습니다.')
    }
  }

  useEffect(() => {
    fetchBranches()
  }, [statusFilter])

  const filtered = branches.filter((row) => {
    return !search || [row.branch_name, row.manager_name, row.address].some((v) => v?.includes(search))
  })

  useEffect(() => {
    if (showManagerBranchId) {
      fetchManagers(showManagerBranchId.id)
    }
  }, [showManagerBranchId])

  const renderColumns = branchColumns.map((col) =>
    col.key === 'manager_name'
      ? { ...col, render: (_v: unknown, row: Record<string, unknown>) => (
          <button className="link-btn" onClick={(e) => { 
            e.stopPropagation(); 
            setShowManagerBranchId({id: Number(row.branch_id), name: String(row.branch_name)});
          }}>
            {String(row.manager_name || '없음')}
          </button>
        )}
      : col
  )

  const dataWithNo = filtered.map((b, i) => ({ ...b, no: i + 1 }))

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
              {['전체', '활성', '비활성'].map((s) => <option key={s}>{s}</option>)}
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
          { label: '신규', variant: 'primary', onClick: () => alert('신규') },
          { label: '저장', variant: 'secondary', onClick: () => alert('저장') },
          { label: '삭제', variant: 'danger', onClick: () => alert('삭제'), disabled: selected.size === 0 },
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
            if (next.has(idx)) { next.delete(idx) } else { next.add(idx) }
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
    </div>
  )
}

