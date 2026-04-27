import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader'
import ToolBar from '../../components/common/ToolBar'
import DataTable from '../../components/common/DataTable'
import SummaryCard from '../../components/common/SummaryCard'
import StatusBadge from '../../components/common/StatusBadge'
import './DeviceBiometric.css'

const MODEL_OPTIONS = ['전체', 'ERK-100', 'ERK-200']

const mockData = [
  { no: 1, branch: '강남지점', deviceId: 'DV-001', model: 'ERK-100', battery: '85%', user: '홍길동', lastDate: '2024-04-27', lastTime: '09:32', usePerDay: '8h', breathPerDay: '18회/분', stepPerDay: '7,203', totalUse: '120h', totalStep: '456,200', emergency: '-', emergencyTime: '-', updateTime: '2024-04-27 09:32', location: '서울 강남구' },
  { no: 2, branch: '마포지점', deviceId: 'DV-004', model: 'ERK-200', battery: '72%', user: '이영희', lastDate: '2024-04-27', lastTime: '08:45', usePerDay: '7h', breathPerDay: '16회/분', stepPerDay: '5,800', totalUse: '95h', totalStep: '320,100', emergency: '낙상', emergencyTime: '2024-04-27 08:45', updateTime: '2024-04-27 08:45', location: '서울 마포구' },
  { no: 3, branch: '서초지점', deviceId: 'DV-006', model: 'ERK-100', battery: '60%', user: '박민준', lastDate: '2024-04-26', lastTime: '17:10', usePerDay: '9h', breathPerDay: '20회/분', stepPerDay: '9,100', totalUse: '200h', totalStep: '780,000', emergency: '과호흡', emergencyTime: '2024-04-26 17:10', updateTime: '2024-04-26 17:10', location: '서울 서초구' },
  { no: 4, branch: '송파지점', deviceId: 'DV-007', model: 'ERK-200', battery: '45%', user: '최서연', lastDate: '2024-04-25', lastTime: '14:20', usePerDay: '6h', breathPerDay: '14회/분', stepPerDay: '4,200', totalUse: '55h', totalStep: '210,000', emergency: '-', emergencyTime: '-', updateTime: '2024-04-25 14:20', location: '서울 송파구' },
]

const columns = [
  { key: 'no', label: '순번', width: '55px' },
  { key: 'branch', label: '지점' },
  { key: 'deviceId', label: '디바이스 ID' },
  { key: 'model', label: '모델명' },
  { key: 'battery', label: '배터리', width: '70px' },
  { key: 'user', label: '사용자' },
  { key: 'lastDate', label: '최근사용일' },
  { key: 'lastTime', label: '최근사용시간', width: '90px' },
  { key: 'usePerDay', label: '사용시간/일' },
  { key: 'breathPerDay', label: '호흡수/일' },
  { key: 'stepPerDay', label: '걸음수/일' },
  { key: 'totalUse', label: '총사용시간' },
  { key: 'totalStep', label: '총걸음수' },
  { key: 'emergency', label: '응급', render: (v: unknown) =>
    String(v) !== '-' ? <StatusBadge status={String(v)} /> : <span className="text-muted">-</span>
  },
  { key: 'emergencyTime', label: '응급기록시간' },
  { key: 'updateTime', label: '최근업데이트' },
  { key: 'location', label: '최근사용자위치' },
]

export default function DeviceBiometric() {
  const [model, setModel] = useState('전체')
  const [search, setSearch] = useState('')

  const filtered = mockData.filter((row) => {
    const matchModel = model === '전체' || row.model === model
    const matchSearch = !search || [row.branch, row.deviceId, row.model, row.user].some((v) => v.includes(search))
    return matchModel && matchSearch
  })

  return (
    <div>
      <PageHeader
        breadcrumb={['디바이스 관리', '디바이스 사용 생체 정보']}
        title="디바이스 사용 생체 정보"
        description="모델별 디바이스 사용 생체 정보를 조회합니다."
      />

      <SummaryCard
        items={[
          { label: '총수량', value: mockData.length },
          { label: '사용중', value: mockData.length, color: 'var(--success)' },
          { label: '응급발생', value: mockData.filter((d) => d.emergency !== '-').length, color: 'var(--danger)' },
          { label: '과호흡', value: mockData.filter((d) => d.emergency === '과호흡').length, color: 'var(--warning)' },
          { label: '낙상', value: mockData.filter((d) => d.emergency === '낙상').length, color: 'var(--danger)' },
        ]}
      />

      <ToolBar
        left={
          <>
            <select className="filter-select" value={model} onChange={(e) => setModel(e.target.value)}>
              {MODEL_OPTIONS.map((m) => <option key={m}>{m}</option>)}
            </select>
            <input
              className="search-input"
              placeholder="지점명, 디바이스ID, 모델명, 사용자 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </>
        }
        buttons={[
          { label: '저장', variant: 'secondary', onClick: () => alert('저장') },
          { label: '삭제', variant: 'danger', onClick: () => alert('삭제') },
        ]}
      />

      <DataTable
        columns={columns as Parameters<typeof DataTable>[0]['columns']}
        data={filtered as Record<string, unknown>[]}
      />
      <p className="table-info">총 {filtered.length}건</p>
    </div>
  )
}
