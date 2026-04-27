import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader'
import ToolBar from '../../components/common/ToolBar'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import Modal from '../../components/common/Modal'
import './BranchManagement.css'

const mockBranches = [
  { no: 1, status: '활성', branch: '강남지점', manager: '김담당', managerTel: '010-1234-5678', address: '서울 강남구 테헤란로 123', detailAddress: '1층', headName: '이지점장', tel: '02-1234-5678', fax: '02-1234-5679' },
  { no: 2, status: '활성', branch: '서초지점', manager: '박담당', managerTel: '010-2345-6789', address: '서울 서초구 서초대로 456', detailAddress: '2층', headName: '박지점장', tel: '02-2345-6789', fax: '02-2345-6790' },
  { no: 3, status: '비활성', branch: '마포지점', manager: '이담당', managerTel: '010-3456-7890', address: '서울 마포구 마포대로 789', detailAddress: '3층', headName: '최지점장', tel: '02-3456-7890', fax: '02-3456-7891' },
  { no: 4, status: '활성', branch: '송파지점', manager: '최담당', managerTel: '010-4567-8901', address: '서울 송파구 올림픽로 321', detailAddress: '1층', headName: '정지점장', tel: '02-4567-8901', fax: '02-4567-8902' },
]

const mockManagers = [
  { no: 1, name: '김담당', branch: '강남지점', tel: '010-1234-5678', email: 'kim@erica.com', type: '주', status: '활성' },
  { no: 2, name: '홍부담당', branch: '강남지점', tel: '010-9876-5432', email: 'hong@erica.com', type: '부', status: '활성' },
]

const branchColumns = [
  { key: 'no', label: '순번', width: '55px' },
  { key: 'status', label: '상태', render: (v: unknown) => <StatusBadge status={String(v)} /> },
  { key: 'branch', label: '지점' },
  { key: 'manager', label: '주담당자', render: (v: unknown) => (
    <button className="link-btn">{String(v)}</button>
  )},
  { key: 'managerTel', label: '주담당자연락처' },
  { key: 'address', label: '주소' },
  { key: 'detailAddress', label: '상세주소' },
  { key: 'headName', label: '지점장명' },
  { key: 'tel', label: '대표전화번호' },
  { key: 'fax', label: '대표팩스번호' },
]

const managerColumns = [
  { key: 'no', label: '순번', width: '55px' },
  { key: 'name', label: '담당자명' },
  { key: 'branch', label: '담당지점' },
  { key: 'tel', label: '연락처' },
  { key: 'email', label: '이메일' },
  { key: 'type', label: '주/부', width: '60px' },
  { key: 'status', label: '상태', render: (v: unknown) => <StatusBadge status={String(v)} /> },
]

export default function BranchManagement() {
  const [selected, setSelected] = useState(new Set<number>())
  const [showManager, setShowManager] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('전체')
  const [search, setSearch] = useState('')

  const filtered = mockBranches.filter((row) => {
    const matchStatus = statusFilter === '전체' || row.status === statusFilter
    const matchSearch = !search || [row.branch, row.manager, row.address].some((v) => v.includes(search))
    return matchStatus && matchSearch
  })

  const renderColumns = branchColumns.map((col) =>
    col.key === 'manager'
      ? { ...col, render: (_v: unknown, row: Record<string, unknown>) => (
          <button className="link-btn" onClick={(e) => { e.stopPropagation(); setShowManager(String(row.branch)) }}>
            {String(row.manager)}
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

      <DataTable
        columns={renderColumns as Parameters<typeof DataTable>[0]['columns']}
        data={filtered as Record<string, unknown>[]}
        selectedRows={selected}
        onSelectRow={(idx) => {
          const next = new Set(selected)
          if (next.has(idx)) { next.delete(idx) } else { next.add(idx) }
          setSelected(next)
        }}
        onSelectAll={(checked) =>
          setSelected(checked ? new Set(filtered.map((_, i) => i)) : new Set())
        }
      />
      <p className="table-info">총 {filtered.length}건</p>

      {showManager && (
        <Modal title={`${showManager} > 담당자 현황`} onClose={() => setShowManager(null)} width="700px">
          <DataTable
            columns={managerColumns as Parameters<typeof DataTable>[0]['columns']}
            data={mockManagers as Record<string, unknown>[]}
          />
        </Modal>
      )}
    </div>
  )
}
