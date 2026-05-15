import { useState, useEffect } from 'react'
import PageHeader from '../../components/common/PageHeader'
import Modal from '../../components/common/Modal'
import DataTable from '../../components/common/DataTable'
import { api } from '../../services/api'
import './DepartmentTeam.css'

interface Department {
  dept_id: number;
  dept_name: string;
  sort_order: number;
  is_used: string;
  apply_date: string;
}

interface Team {
  team_id: number;
  team_name: string;
  dept_name?: string;
  sort_order: number;
  is_used: string;
  apply_date: string;
}

export default function DepartmentTeam() {
  const [depts, setDepts] = useState<Department[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null)
  const [historyTarget, setHistoryTarget] = useState<string | null>(null)

  const fetchDepts = async () => {
    try {
      const res = await api.get<Department[]>('/depts')
      setDepts(res.data)
      if (res.data.length > 0 && !selectedDeptId) {
        setSelectedDeptId(res.data[0].dept_id)
      }
    } catch (err) { console.error(err) }
  }

  const fetchTeams = async (deptId: number) => {
    try {
      const res = await api.get<Team[]>(`/teams?dept_id=${deptId}`)
      setTeams(res.data)
    } catch (err) { console.error(err) }
  }

  useEffect(() => { fetchDepts() }, [])
  useEffect(() => { if (selectedDeptId) fetchTeams(selectedDeptId) }, [selectedDeptId])

  const deptColumns = [
    { key: 'sort_order', label: '순서', width: '60px' },
    { key: 'history', label: '이력', width: '60px', render: (_v: any, row: any) => (
      <button className="link-btn" onClick={(e) => { e.stopPropagation(); setHistoryTarget(row.dept_name) }}>이력</button>
    )},
    { key: 'dept_name', label: '부서명' },
    { key: 'apply_date', label: '생성적용일' },
    { key: 'is_used', label: '사용', render: (v: any) => v === 'Y' ? 'ON' : 'OFF' },
  ]

  const teamColumns = [
    { key: 'sort_order', label: '순서', width: '60px' },
    { key: 'history', label: '이력', width: '60px', render: (_v: any, row: any) => (
      <button className="link-btn" onClick={(e) => { e.stopPropagation(); setHistoryTarget(row.team_name) }}>이력</button>
    )},
    { key: 'team_name', label: '팀' },
    { key: 'dept_name', label: '부서' },
    { key: 'apply_date', label: '생성적용일' },
    { key: 'is_used', label: '사용', render: (v: any) => v === 'Y' ? 'ON' : 'OFF' },
  ]

  const selectedDeptName = depts.find(d => d.dept_id === selectedDeptId)?.dept_name || ''

  return (
    <div>
      <PageHeader
        breadcrumb={['조직 관리', '부서/팀']}
        title="부서/팀 관리"
        description="조직의 부서 및 팀을 관리합니다."
      />

      <div className="dept-layout">
        <div className="dept-panel">
          <div className="panel-header">
            <span className="panel-title-text">전체 &gt; 부서</span>
            <div className="panel-actions">
              <button className="btn btn-primary btn-sm" onClick={() => alert('신규')}>신규</button>
              <button className="btn btn-secondary btn-sm" onClick={() => alert('저장')}>저장</button>
            </div>
          </div>
          <DataTable 
            columns={deptColumns as any} 
            data={depts as any} 
            onSelectRow={(idx) => setSelectedDeptId(depts[idx].dept_id)}
          />
        </div>

        <div className="dept-panel">
          <div className="panel-header">
            <span className="panel-title-text">{selectedDeptName} &gt; 팀</span>
            <div className="panel-actions">
              <button className="btn btn-primary btn-sm" onClick={() => alert('신규')}>신규</button>
              <button className="btn btn-secondary btn-sm" onClick={() => alert('저장')}>저장</button>
            </div>
          </div>
          <DataTable columns={teamColumns as any} data={teams as any} />
        </div>
      </div>

      {historyTarget && (
        <Modal title={`${historyTarget} 변경 이력`} onClose={() => setHistoryTarget(null)} width="650px">
          <div style={{padding: '20px', textAlign: 'center'}}>이력 조회 API 연동 예정</div>
        </Modal>
      )}
    </div>
  )
}
