import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader'
import ToolBar from '../../components/common/ToolBar'
import DataTable from '../../components/common/DataTable'
import SummaryCard from '../../components/common/SummaryCard'
import StatusBadge from '../../components/common/StatusBadge'
import Modal from '../../components/common/Modal'
import './DeviceAS.css'

const BRANCH_OPTIONS = ['전체', '강남지점', '서초지점', '마포지점', '송파지점']
const STATUS_OPTIONS = ['전체', 'AS접수', 'AS진행', '완료']
const TYPE_OPTIONS = ['전체', '수리', '교체', '점검']

const mockData = [
  { no: 1, history: '보기', status: 'AS접수', sentDate: '2024-04-20', type: '수리', receiveDate: '2024-04-21', receiver: '김담당', checker: '-', checkDate: '-', collectDate: '-', manager: '이기사', completeDate: '-', reSentDate: '-', deviceId: 'DV-003', model: 'ERK-200', detail: '화면 불량' },
  { no: 2, history: '보기', status: 'AS진행', sentDate: '2024-04-10', type: '교체', receiveDate: '2024-04-11', receiver: '박담당', checker: '최확인', checkDate: '2024-04-12', collectDate: '2024-04-13', manager: '정기사', completeDate: '-', reSentDate: '-', deviceId: 'DV-005', model: 'ERK-100', detail: '배터리 교체' },
  { no: 3, history: '보기', status: '완료', sentDate: '2024-03-01', type: '점검', receiveDate: '2024-03-02', receiver: '이담당', checker: '김확인', checkDate: '2024-03-03', collectDate: '2024-03-04', manager: '홍기사', completeDate: '2024-03-10', reSentDate: '2024-03-12', deviceId: 'DV-002', model: 'ERK-100', detail: '정기 점검' },
]

const asHistory = [
  { no: 1, status: '완료', receiveDate: '2023-10-01', type: '수리', completeDate: '2023-10-10', manager: '홍기사', detail: '센서 오류 수리' },
  { no: 2, status: '완료', receiveDate: '2024-03-01', type: '점검', completeDate: '2024-03-10', manager: '홍기사', detail: '정기 점검' },
]

const columns = [
  { key: 'no', label: '순번', width: '55px' },
  { key: 'history', label: '이력', render: (_v: unknown, row: Record<string, unknown>) => (
    <button className="link-btn">📋 {String(row.model)}</button>
  )},
  { key: 'status', label: '상태', render: (v: unknown) => <StatusBadge status={String(v)} /> },
  { key: 'sentDate', label: '지점발송일' },
  { key: 'type', label: '유형' },
  { key: 'receiveDate', label: '접수일' },
  { key: 'receiver', label: '접수자' },
  { key: 'checker', label: '확인자' },
  { key: 'checkDate', label: '확인일' },
  { key: 'collectDate', label: '수거일' },
  { key: 'manager', label: '담당자' },
  { key: 'completeDate', label: '완료일' },
  { key: 'reSentDate', label: '재발송일' },
  { key: 'deviceId', label: '디바이스 ID' },
  { key: 'model', label: '모델명' },
  { key: 'detail', label: '상세' },
]

const historyColumns = [
  { key: 'no', label: '순번', width: '55px' },
  { key: 'status', label: '상태', render: (v: unknown) => <StatusBadge status={String(v)} /> },
  { key: 'receiveDate', label: '접수일' },
  { key: 'type', label: '유형' },
  { key: 'completeDate', label: '완료일' },
  { key: 'manager', label: '담당자' },
  { key: 'detail', label: '상세내용' },
]

export default function DeviceAS() {
  const [branch, setBranch] = useState('전체') // 지점별 데이터 연동 시 사용
  const [status, setStatus] = useState('전체')
  const [type, setType] = useState('전체')
  const [selected, setSelected] = useState(new Set<number>())
  const [showHistory, setShowHistory] = useState(false)

  const filtered = mockData.filter((row) => {
    const matchStatus = status === '전체' || row.status === status
    const matchType = type === '전체' || row.type === type
    return matchStatus && matchType
  })

  const renderColumns = columns.map((col) =>
    col.key === 'history'
      ? { ...col, render: (_v: unknown, row: Record<string, unknown>) => (
          <button className="link-btn" onClick={(e) => { e.stopPropagation(); setShowHistory(true) }}>
            📋 {String(row.model)}
          </button>
        )}
      : col
  )

  return (
    <div>
      <PageHeader
        breadcrumb={['디바이스 관리', '디바이스 AS 관리']}
        title="디바이스 AS 관리"
        description="디바이스의 AS 진행을 관리합니다."
      />

      <SummaryCard
        items={[
          { label: '총수량', value: mockData.length },
          { label: 'AS', value: mockData.length },
          { label: 'AS접수', value: mockData.filter((d) => d.status === 'AS접수').length, color: 'var(--warning)' },
          { label: 'AS진행', value: mockData.filter((d) => d.status === 'AS진행').length, color: 'var(--info)' },
          { label: '완료', value: mockData.filter((d) => d.status === '완료').length, color: 'var(--success)' },
        ]}
      />

      <ToolBar
        left={
          <>
            <select className="filter-select" value={branch} onChange={(e) => { setBranch(e.target.value); setSelected(new Set()) }}>
              {BRANCH_OPTIONS.map((b) => <option key={b}>{b}</option>)}
            </select>
            <select className="filter-select" value={status} onChange={(e) => { setStatus(e.target.value); setSelected(new Set()) }}>
              {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select className="filter-select" value={type} onChange={(e) => { setType(e.target.value); setSelected(new Set()) }}>
              {TYPE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
            </select>
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

      {showHistory && (
        <Modal title="ERK-200 > AS 이력" onClose={() => setShowHistory(false)} width="700px">
          <DataTable
            columns={historyColumns as Parameters<typeof DataTable>[0]['columns']}
            data={asHistory as Record<string, unknown>[]}
          />
        </Modal>
      )}
    </div>
  )
}
