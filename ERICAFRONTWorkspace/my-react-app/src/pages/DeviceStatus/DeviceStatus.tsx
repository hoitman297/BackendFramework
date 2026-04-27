import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader'
import ToolBar from '../../components/common/ToolBar'
import DataTable from '../../components/common/DataTable'
import SummaryCard from '../../components/common/SummaryCard'
import StatusBadge from '../../components/common/StatusBadge'
import './DeviceStatus.css'

const BRANCHES = ['전체', '미발송', '강남지점', '서초지점', '마포지점', '송파지점']

const STATUS_OPTIONS = ['전체', '미출고', '반품', '폐기', '업체목록']

const mockData = [
  { no: 1, status: '사용중', branch: '강남지점', sentDate: '2024-01-10', deviceId: 'DV-001', model: 'ERK-100', battery: '85%', lastRental: '2024-03-01', lastAS: '-', inDate: '2024-01-05', remark: '' },
  { no: 2, status: '미출고', branch: '강남지점', sentDate: '-', deviceId: 'DV-002', model: 'ERK-100', battery: '100%', lastRental: '-', lastAS: '-', inDate: '2024-01-05', remark: '' },
  { no: 3, status: '반품', branch: '서초지점', sentDate: '2024-02-01', deviceId: 'DV-003', model: 'ERK-200', battery: '30%', lastRental: '2024-02-28', lastAS: '2024-03-10', inDate: '2024-01-08', remark: '배터리 불량' },
  { no: 4, status: '사용중', branch: '마포지점', sentDate: '2024-01-15', deviceId: 'DV-004', model: 'ERK-200', battery: '72%', lastRental: '2024-03-05', lastAS: '-', inDate: '2024-01-10', remark: '' },
  { no: 5, status: '폐기', branch: '송파지점', sentDate: '2023-12-01', deviceId: 'DV-005', model: 'ERK-100', battery: '0%', lastRental: '2023-11-20', lastAS: '2023-12-10', inDate: '2023-11-01', remark: '파손' },
]

const columns = [
  { key: 'no', label: '순번', width: '55px' },
  { key: 'status', label: '상태', render: (v: unknown) => <StatusBadge status={String(v)} /> },
  { key: 'branch', label: '지점' },
  { key: 'sentDate', label: '지점발송일' },
  { key: 'deviceId', label: '디바이스 ID', width: '100px' },
  { key: 'model', label: '모델명' },
  { key: 'battery', label: '배터리', width: '70px' },
  { key: 'lastRental', label: '최근 임대일' },
  { key: 'lastAS', label: '최근 AS' },
  { key: 'inDate', label: '입고일' },
  { key: 'remark', label: '비고' },
]

export default function DeviceStatus() {
  const [branch, setBranch] = useState('전체')
  const [statusFilter, setStatusFilter] = useState('전체')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(new Set<number>())

  const filtered = mockData.filter((row) => {
    const matchBranch =
      branch === '전체' ||
      (branch === '미발송' ? row.sentDate === '-' : row.branch === branch)
    const matchStatus = statusFilter === '전체' || row.status === statusFilter
    const matchSearch = !search || Object.values(row).some((v) => String(v).includes(search))
    return matchBranch && matchStatus && matchSearch
  })

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
          <ul className="branch-list">
            {BRANCHES.map((b) => (
              <li
                key={b}
                className={`branch-item${branch === b ? ' active' : ''}`}
                onClick={() => { setBranch(b); setSelected(new Set()) }}
              >
                <span>{b}</span>
                {b !== '전체' && b !== '미발송' && (
                  <span className="branch-count">
                    {mockData.filter((d) => d.branch === b).length}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </aside>

        {/* 메인 패널 */}
        <div className="device-main">
          <SummaryCard
            items={[
              { label: '전체', value: mockData.length },
              { label: '미출고', value: mockData.filter((d) => d.status === '미출고').length },
              { label: '사용중', value: mockData.filter((d) => d.status === '사용중').length },
              { label: '반품', value: mockData.filter((d) => d.status === '반품').length, color: '#d69e2e' },
              { label: '폐기', value: mockData.filter((d) => d.status === '폐기').length, color: '#e53e3e' },
            ]}
          />

          <ToolBar
            left={
              <>
                <select
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setSelected(new Set()) }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <input
                  className="search-input"
                  placeholder="디바이스 ID, 모델명 검색..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setSelected(new Set()) }}
                />
              </>
            }
            buttons={[
              { label: '신규', variant: 'primary', onClick: () => alert('신규 행 추가') },
              { label: '저장', variant: 'secondary', onClick: () => alert('저장') },
              { label: '삭제', variant: 'danger', onClick: () => alert('삭제'), disabled: selected.size === 0 },
            ]}
          />

          <DataTable
            columns={columns as Parameters<typeof DataTable>[0]['columns']}
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
        </div>
      </div>
    </div>
  )
}
