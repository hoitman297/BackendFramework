import { useState, useEffect } from 'react'
import PageHeader from '../../components/common/PageHeader'
import ToolBar from '../../components/common/ToolBar'
import DataTable from '../../components/common/DataTable'
import SummaryCard from '../../components/common/SummaryCard'
import StatusBadge from '../../components/common/StatusBadge'
import { api } from '../../services/api'
import './DeviceBiometric.css'

interface DeviceLog {
  log_id: number;
  device_id: number;
  user_id: number;
  user_name: string;
  branch_name: string;
  model_name: string;
  last_used_date: string;
  usage_time_per_day: number;
  total_usage_time: number;
  resp_rate_per_day: number;
  steps_per_day: number;
  last_location: string;
  created_at: string;
  emergency_status?: string;
  emergency_time?: string;
}

export default function DeviceBiometric() {
  const [logs, setLogs] = useState<DeviceLog[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const fetchLogs = async () => {
    setLoading(true)
    try {
      // API 명세 (LOG-002) - 실제론 user_id가 필요하지만 목록 조회를 위해 /logs 엔드포인트 가정
      const res = await api.get<DeviceLog[]>('/logs')
      setLogs(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [])

  const filtered = logs.filter((row) => {
    return !search || [row.user_name, row.branch_name, row.model_name].some(v => v?.includes(search))
  })

  const columns = [
    { key: 'no', label: '순번', width: '55px' },
    { key: 'branch_name', label: '지점' },
    { key: 'user_name', label: '사용자' },
    { key: 'model_name', label: '모델명' },
    { key: 'last_used_date', label: '최근사용일' },
    { key: 'usage_time_per_day', label: '사용시간/일', render: (v: any) => `${v}분` },
    { key: 'resp_rate_per_day', label: '호흡수/일', render: (v: any) => `${v}회/분` },
    { key: 'steps_per_day', label: '걸음수/일', render: (v: any) => v?.toLocaleString() },
    { key: 'total_usage_time', label: '총사용시간', render: (v: any) => `${(v/60).toFixed(1)}h` },
    { key: 'emergency_status', label: '응급', render: (v: unknown) => 
      v ? <StatusBadge status={String(v)} /> : <span className="text-muted">-</span>
    },
    { key: 'emergency_time', label: '응급기록시간' },
    { key: 'last_location', label: '최근위치' },
  ]

  return (
    <div>
      <PageHeader
        breadcrumb={['디바이스 관리', '디바이스 사용 생체 정보']}
        title="디바이스 사용 생체 정보"
        description="모델별 디바이스 사용 생체 정보를 조회합니다."
      />

      <SummaryCard
        items={[
          { label: '조회 데이터', value: logs.length },
          { label: '응급발생', value: logs.filter(l => l.emergency_status).length, color: 'var(--danger)' },
        ]}
      />

      <ToolBar
        left={
          <input 
            className="search-input" 
            placeholder="사용자, 지점, 모델 검색..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        }
        buttons={[{ label: '새로고침', variant: 'secondary', onClick: fetchLogs }]}
      />

      {loading ? (
        <div className="loading-state">데이터를 조회 중입니다...</div>
      ) : (
        <DataTable
          columns={columns as any}
          data={filtered.map((l, i) => ({ ...l, no: i + 1 })) as any}
        />
      )}
    </div>
  )
}
