import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader'
import ToolBar from '../../components/common/ToolBar'
import DataTable from '../../components/common/DataTable'
import SummaryCard from '../../components/common/SummaryCard'
import StatusBadge from '../../components/common/StatusBadge'
import Modal from '../../components/common/Modal'
import './DeviceRental.css'

const BRANCHES = ['전체', '강남지점', '서초지점', '마포지점', '송파지점']

const STATUS_OPTIONS = ['전체', '신청', '수령대기', '사용중', '이상접수', '교체사용', '반납']

const mockData = [
  { no: 1, status: '사용중', branch: '강남지점', applicant: '홍길동', applicantId: 'hong001', applyDate: '2024-03-01', startDate: '2024-03-05', returnDue: '2024-06-05', receiveDate: '2024-03-05', worn: 'Y', deviceId: 'DV-001', model: 'ERK-100', battery: '85%', returnDate: '-' },
  { no: 2, status: '신청', branch: '서초지점', applicant: '김철수', applicantId: 'kim002', applyDate: '2024-04-01', startDate: '2024-04-05', returnDue: '2024-07-05', receiveDate: '-', worn: '-', deviceId: '-', model: 'ERK-200', battery: '-', returnDate: '-' },
  { no: 3, status: '수령대기', branch: '마포지점', applicant: '이영희', applicantId: 'lee003', applyDate: '2024-03-20', startDate: '2024-03-25', returnDue: '2024-06-25', receiveDate: '-', worn: '-', deviceId: 'DV-004', model: 'ERK-100', battery: '100%', returnDate: '-' },
  { no: 4, status: '반납', branch: '강남지점', applicant: '박민준', applicantId: 'park004', applyDate: '2024-01-10', startDate: '2024-01-15', returnDue: '2024-04-15', receiveDate: '2024-01-15', worn: 'Y', deviceId: 'DV-002', model: 'ERK-100', battery: '-', returnDate: '2024-04-14' },
  { no: 5, status: '이상접수', branch: '송파지점', applicant: '최서연', applicantId: 'choi005', applyDate: '2024-02-01', startDate: '2024-02-05', returnDue: '2024-05-05', receiveDate: '2024-02-05', worn: 'Y', deviceId: 'DV-005', model: 'ERK-200', battery: '45%', returnDate: '-' },
]

const historyData = [
  { no: 1, status: '반납', branch: '강남지점', startDate: '2023-06-01', returnDue: '2023-09-01', receiveDate: '2023-06-01', worn: 'Y', deviceId: 'DV-010', model: 'ERK-100', returnDate: '2023-08-30' },
  { no: 2, status: '사용중', branch: '강남지점', startDate: '2024-03-01', returnDue: '2024-06-05', receiveDate: '2024-03-05', worn: 'Y', deviceId: 'DV-001', model: 'ERK-100', returnDate: '-' },
]

const columns = [
  { key: 'no', label: '순번', width: '55px' },
  { key: 'status', label: '상태', render: (v: unknown) => <StatusBadge status={String(v)} /> },
  { key: 'branch', label: '지점' },
  { key: 'applicant', label: '신청자', render: (v: unknown) => (
    <button className="link-btn" onClick={(e) => { e.stopPropagation() }}>{String(v)}</button>
  )},
  { key: 'applicantId', label: '신청자 ID' },
  { key: 'applyDate', label: '신청일' },
  { key: 'startDate', label: '사용예정시작일' },
  { key: 'returnDue', label: '반납예정일' },
  { key: 'receiveDate', label: '수령일' },
  { key: 'worn', label: '착용여부', width: '70px' },
  { key: 'deviceId', label: '디바이스 ID' },
  { key: 'model', label: '모델명' },
  { key: 'battery', label: '배터리', width: '70px' },
  { key: 'returnDate', label: '반납일' },
]

const historyColumns = [
  { key: 'no', label: '순번', width: '55px' },
  { key: 'status', label: '상태', render: (v: unknown) => <StatusBadge status={String(v)} /> },
  { key: 'branch', label: '지점' },
  { key: 'startDate', label: '사용예정시작일' },
  { key: 'returnDue', label: '반납예정일' },
  { key: 'receiveDate', label: '수령일' },
  { key: 'worn', label: '착용여부' },
  { key: 'deviceId', label: '디바이스 ID' },
  { key: 'model', label: '모델명' },
  { key: 'returnDate', label: '반납일' },
]

export default function DeviceRental() {
  const [branch, setBranch] = useState('전체')
  const [status, setStatus] = useState('전체')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(new Set<number>())
  const [historyUser, setHistoryUser] = useState<string | null>(null)

  const filtered = mockData.filter((row) => {
    const matchBranch = branch === '전체' || row.branch === branch
    const matchStatus = status === '전체' || row.status === status
    const matchSearch = !search || [row.branch, row.applicant, row.applicantId, row.deviceId, row.model].some((v) => v.includes(search))
    return matchBranch && matchStatus && matchSearch
  })

  const renderColumns = columns.map((col) =>
    col.key === 'applicant'
      ? { ...col, render: (_v: unknown, row: Record<string, unknown>) => (
          <button className="link-btn" onClick={(e) => { e.stopPropagation(); setHistoryUser(String(row.applicant)) }}>
            {String(row.applicant)}
          </button>
        )}
      : col
  )

  return (
    <div>
      <PageHeader
        breadcrumb={['디바이스 관리', '디바이스 임대 현황']}
        title="디바이스 임대 현황"
        description="지점별 디바이스 임대 현황을 관리합니다."
      />

      <SummaryCard
        items={[
          { label: '총수량', value: mockData.length },
          { label: '임대중', value: mockData.filter((d) => d.status === '사용중').length, color: 'var(--success)' },
          { label: '신청', value: mockData.filter((d) => d.status === '신청').length },
          { label: '수령대기', value: mockData.filter((d) => d.status === '수령대기').length, color: 'var(--warning)' },
          { label: '이상접수', value: mockData.filter((d) => d.status === '이상접수').length, color: 'var(--danger)' },
        ]}
      />

      <ToolBar
        left={
          <>
            <select className="filter-select" value={branch} onChange={(e) => { setBranch(e.target.value); setSelected(new Set()) }}>
              {BRANCHES.map((b) => <option key={b}>{b}</option>)}
            </select>
            <select className="filter-select" value={status} onChange={(e) => { setStatus(e.target.value); setSelected(new Set()) }}>
              {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <input
              className="search-input"
              placeholder="지점명, 디바이스ID, 모델명, 신청자 검색..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelected(new Set()) }}
            />
          </>
        }
        buttons={[
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

      {historyUser && (
        <Modal title={`${historyUser} > 임대이력`} onClose={() => setHistoryUser(null)} width="800px">
          <DataTable
            columns={historyColumns as Parameters<typeof DataTable>[0]['columns']}
            data={historyData as Record<string, unknown>[]}
          />
        </Modal>
      )}
    </div>
  )
}
