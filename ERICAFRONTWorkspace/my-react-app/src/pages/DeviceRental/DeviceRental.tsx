import { useState, useEffect } from 'react'
import PageHeader from '../../components/common/PageHeader'
import ToolBar from '../../components/common/ToolBar'
import DataTable from '../../components/common/DataTable'
import SummaryCard from '../../components/common/SummaryCard'
import StatusBadge from '../../components/common/StatusBadge'
import Modal from '../../components/common/Modal'
import { api } from '../../services/api'
import './DeviceRental.css'

interface Rental {
  rental_id: number;
  device_id: number;
  branch_name: string;
  status_rent: number;
  status_text: string;
  user_name: string;
  user_id: number;
  req_date: string;
  exp_start_date: string;
  exp_return_date: string;
  receipt_date?: string;
  is_worn: string;
  model_name: string;
  battery_level?: number;
  return_date?: string;
}

const STATUS_MAP: Record<number, string> = {
  0: '신청', 1: '수령대기', 2: '사용중', 3: '반납완료', 9: '취소'
}

export default function DeviceRental() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [branches, setBranches] = useState<{id: number, name: string}[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState('전체')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [historyUser, setHistoryUser] = useState<{id: number, name: string} | null>(null)
  const [userHistory, setUserHistory] = useState<Rental[]>([])

  const fetchBranches = async () => {
    try {
      const res = await api.get<any[]>('/branches')
      setBranches(res.data.map(b => ({ id: b.branch_id, name: b.branch_name })))
    } catch (err) { console.error(err) }
  }

  const fetchRentals = async () => {
    setLoading(true)
    try {
      const res = await api.get<Rental[]>('/rentals')
      setRentals(res.data.map(r => ({ ...r, status_text: STATUS_MAP[r.status_rent] || '알수없음' })))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserHistory = async (userId: number) => {
    try {
      const res = await api.get<Rental[]>(`/rentals/history/${userId}`)
      setUserHistory(res.data.map(r => ({ ...r, status_text: STATUS_MAP[r.status_rent] || '알수없음' })))
    } catch (err) { console.error(err) }
  }

  useEffect(() => { fetchBranches(); fetchRentals(); }, [])
  useEffect(() => { if (historyUser) fetchUserHistory(historyUser.id) }, [historyUser])

  const filtered = rentals.filter((row) => {
    const matchBranch = !selectedBranchId || row.branch_name === branches.find(b => b.id === selectedBranchId)?.name
    const matchStatus = statusFilter === '전체' || row.status_text === statusFilter
    const matchSearch = !search || [row.user_name, row.model_name].some(v => v?.includes(search))
    return matchBranch && matchStatus && matchSearch
  })

  const columns = [
    { key: 'no', label: '순번', width: '55px' },
    { key: 'status_text', label: '상태', render: (v: unknown) => <StatusBadge status={String(v)} /> },
    { key: 'branch_name', label: '지점' },
    { key: 'user_name', label: '신청자', render: (v: unknown, row: any) => (
      <button className="link-btn" onClick={(e) => { e.stopPropagation(); setHistoryUser({id: row.user_id, name: String(v)}) }}>{String(v)}</button>
    )},
    { key: 'user_id', label: '신청자ID' },
    { key: 'req_date', label: '신청일' },
    { key: 'exp_start_date', label: '사용예정시작일' },
    { key: 'exp_return_date', label: '반납예정일' },
    { key: 'receipt_date', label: '수령일' },
    { key: 'is_worn', label: '착용여부' },
    { key: 'device_id', label: '디바이스ID' },
    { key: 'model_name', label: '모델명' },
    { key: 'battery_level', label: '배터리' },
    { key: 'return_date', label: '반납일' },
  ]

  return (
    <div>
      <PageHeader
        breadcrumb={['디바이스 관리', '디바이스 임대 현황']}
        title="디바이스 임대 현황"
        description="지점별 디바이스 임대 현황을 관리합니다."
      />

      <SummaryCard
        items={[
          { label: '총수량', value: rentals.length },
          { label: '임대중', value: rentals.filter(r => r.status_rent === 2).length, color: 'var(--success)' },
          { label: '신청', value: rentals.filter(r => r.status_rent === 0).length },
          { label: '수령대기', value: rentals.filter(r => r.status_rent === 1).length, color: 'var(--warning)' },
        ]}
      />

      <ToolBar
        left={
          <>
            <select className="filter-select" value={selectedBranchId || ''} onChange={(e) => setSelectedBranchId(Number(e.target.value) || null)}>
              <option value="">전체 지점</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
               <option value="전체">전체 상태</option>
               {Object.values(STATUS_MAP).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input className="search-input" placeholder="신청자, 모델명 검색..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </>
        }
        buttons={[{ label: '저장', variant: 'secondary', onClick: () => alert('저장') }]}
      />

      {loading ? (
        <div className="loading-state">임대 현황을 불러오는 중...</div>
      ) : (
        <DataTable
          columns={columns as any}
          data={filtered.map((r, i) => ({ ...r, no: i + 1 })) as any}
        />
      )}

      {historyUser && (
        <Modal title={`${historyUser.name} > 임대이력`} onClose={() => setHistoryUser(null)} width="850px">
           <DataTable
             columns={columns as any}
             data={userHistory.map((r, i) => ({ ...r, no: i + 1 })) as any}
           />
        </Modal>
      )}
    </div>
  )
}

