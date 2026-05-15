import { useState, useEffect } from 'react'
import PageHeader from '../../components/common/PageHeader'
import ToolBar from '../../components/common/ToolBar'
import DataTable from '../../components/common/DataTable'
import SummaryCard from '../../components/common/SummaryCard'
import StatusBadge from '../../components/common/StatusBadge'
import Modal from '../../components/common/Modal'
import { api } from '../../services/api'
import './DeviceAS.css'

interface DeviceASData {
  as_id: number;
  device_id: number;
  branch_id: number;
  branch_name: string;
  status_as: number;
  status_text: string;
  type_as: number;
  type_text: string;
  receipt_date?: string;
  receipt_details?: string;
  checker_name?: string;
  collection_date?: string;
  manager_name?: string;
  repair_details?: string;
  completion_date?: string;
  redispatch_date?: string;
  model_name: string;
}

const AS_STATUS_MAP: Record<number, string> = {
  0: '이상무', 1: '접수', 2: '진행중', 3: '완료', 9: '취소'
}

const AS_TYPE_MAP: Record<number, string> = {
  0: '파손', 1: '침수', 2: '소프트웨어', 3: '기타', 9: '불명'
}

export default function DeviceAS() {
  const [asItems, setAsItems] = useState<DeviceASData[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('전체')
  const [typeFilter, setTypeFilter] = useState('전체')
  const [search, setSearch] = useState('')
  const [detailItem, setDetailItem] = useState<DeviceASData | null>(null)

  const fetchASList = async () => {
    setLoading(true)
    try {
      // API 명세 (AS-002) - 기간 검색 등 파라미터는 필요시 추가
      const res = await api.get<DeviceASData[]>('/as')
      setAsItems(res.data.map(item => ({
        ...item,
        status_text: AS_STATUS_MAP[item.status_as] || '알수없음',
        type_text: AS_TYPE_MAP[item.type_as] || '알수없음'
      })))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchASList() }, [])

  const filtered = asItems.filter((row) => {
    const matchStatus = statusFilter === '전체' || row.status_text === statusFilter
    const matchType = typeFilter === '전체' || row.type_text === typeFilter
    const matchSearch = !search || [row.model_name, row.manager_name, row.checker_name].some(v => v?.includes(search))
    return matchStatus && matchType && matchSearch
  })

  const columns = [
    { key: 'no', label: '순번', width: '55px' },
    { key: 'status_text', label: '상태', render: (v: unknown) => <StatusBadge status={String(v)} /> },
    { key: 'type_text', label: '유형' },
    { key: 'receipt_date', label: '접수일' },
    { key: 'model_name', label: '모델명', render: (v: unknown, row: any) => (
      <button className="link-btn" onClick={(e) => { e.stopPropagation(); setDetailItem(row) }}>📋 {String(v)}</button>
    )},
    { key: 'checker_name', label: '확인자' },
    { key: 'collection_date', label: '수거일' },
    { key: 'manager_name', label: '담당자' },
    { key: 'completion_date', label: '완료일' },
    { key: 'redispatch_date', label: '재발송일' },
    { key: 'device_id', label: '디바이스ID' },
  ]

  return (
    <div>
      <PageHeader
        breadcrumb={['디바이스 관리', '디바이스 AS 관리']}
        title="디바이스 AS 관리"
        description="디바이스의 AS 진행을 관리합니다."
      />

      <SummaryCard
        items={[
          { label: '전체', value: asItems.length },
          { label: 'AS접수', value: asItems.filter(i => i.status_as === 1).length, color: 'var(--warning)' },
          { label: 'AS진행', value: asItems.filter(i => i.status_as === 2).length, color: 'var(--info)' },
          { label: '완료', value: asItems.filter(i => i.status_as === 3).length, color: 'var(--success)' },
        ]}
      />

      <ToolBar
        left={
          <>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="전체">전체 상태</option>
              {Object.values(AS_STATUS_MAP).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="전체">전체 유형</option>
              {Object.values(AS_TYPE_MAP).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input className="search-input" placeholder="모델명, 담당자 검색..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </>
        }
        buttons={[
          { label: '신규 접수', variant: 'primary', onClick: () => alert('AS-001 API 연동 예정') },
          { label: '저장', variant: 'secondary', onClick: () => alert('AS-004 API 연동 예정') },
        ]}
      />

      {loading ? (
        <div className="loading-state">AS 데이터를 불러오는 중...</div>
      ) : (
        <DataTable
          columns={columns as any}
          data={filtered.map((item, i) => ({ ...item, no: i + 1 })) as any}
        />
      )}

      {detailItem && (
        <Modal title={`${detailItem.model_name} > AS 상세 내역`} onClose={() => setDetailItem(null)} width="700px">
           <div className="as-detail-content">
              <section>
                <h4>접수 내역 (AS-003)</h4>
                <p>{detailItem.receipt_details || '내역 없음'}</p>
              </section>
              <section style={{marginTop: '20px'}}>
                <h4>수리 내역</h4>
                <p>{detailItem.repair_details || '수리 진행 전입니다.'}</p>
              </section>
           </div>
        </Modal>
      )}
    </div>
  )
}

