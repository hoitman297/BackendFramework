import { useState, useEffect } from 'react'
import PageHeader from '../../components/common/PageHeader'
import Modal from '../../components/common/Modal'
import DataTable from '../../components/common/DataTable'
import { api } from '../../services/api'
import './DepartmentTeam.css'

interface Department {
  dept_id?: number
  dept_name: string
  sort_order: number
  is_used: string
  apply_date: string | null
}

interface Team {
  team_id?: number
  dept_id?: number
  team_name: string
  dept_name?: string
  sort_order: number
  is_used: string
  apply_date: string | null
}

type ModalType = 'dept' | 'team' | null

const today = () => new Date().toISOString().slice(0, 10)

export default function DepartmentTeam() {
  const [depts, setDepts] = useState<Department[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null)
  const [selectedDeptRow, setSelectedDeptRow] = useState<Department | null>(null)
  const [selectedTeamRow, setSelectedTeamRow] = useState<Team | null>(null)
  const [historyTarget, setHistoryTarget] = useState<string | null>(null)
  const [keyword, setKeyword] = useState('')
  const [modalType, setModalType] = useState<ModalType>(null)
  const [deptForm, setDeptForm] = useState<Department>({ dept_name: '', sort_order: 1, is_used: 'Y', apply_date: today() })
  const [teamForm, setTeamForm] = useState<Team>({ team_name: '', sort_order: 1, is_used: 'Y', apply_date: today() })

  const fetchDepts = async (kw = keyword) => {
    const params = new URLSearchParams()
    if (kw.trim()) params.append('keyword', kw.trim())
    const res = await api.get<Department[]>(`/depts?${params.toString()}`)
    setDepts(res.data)
    if (res.data.length > 0 && !selectedDeptId) setSelectedDeptId(res.data[0].dept_id!)
  }

  const fetchTeams = async (deptId = selectedDeptId, kw = keyword) => {
    const params = new URLSearchParams()
    if (deptId) params.append('dept_id', String(deptId))
    if (kw.trim()) params.append('keyword', kw.trim())
    const res = await api.get<Team[]>(`/teams?${params.toString()}`)
    setTeams(res.data)
  }

  const refresh = async () => {
    await fetchDepts()
    await fetchTeams()
  }

  useEffect(() => { fetchDepts() }, [])
  useEffect(() => { if (selectedDeptId) fetchTeams(selectedDeptId) }, [selectedDeptId])

  const runSearch = async () => {
    await fetchDepts(keyword)
    await fetchTeams(selectedDeptId, keyword)
  }

  const openNewDept = () => {
    setDeptForm({ dept_name: '', sort_order: depts.length + 1, is_used: 'Y', apply_date: today() })
    setModalType('dept')
  }

  const openNewTeam = () => {
    if (!selectedDeptId) return alert('먼저 부서를 선택하세요.')
    setTeamForm({ dept_id: selectedDeptId, team_name: '', sort_order: teams.length + 1, is_used: 'Y', apply_date: today() })
    setModalType('team')
  }

  const saveDept = async () => {
    if (!deptForm.dept_name.trim()) return alert('부서명을 입력하세요.')
    if (deptForm.dept_id) await api.patch(`/depts/${deptForm.dept_id}`, deptForm)
    else await api.post('/depts', deptForm)
    setModalType(null)
    await refresh()
  }

  const saveTeam = async () => {
    if (!teamForm.team_name.trim()) return alert('팀명을 입력하세요.')
    const payload = { ...teamForm, dept_id: teamForm.dept_id || selectedDeptId }
    if (teamForm.team_id) await api.patch(`/teams/${teamForm.team_id}`, payload)
    else await api.post('/teams', payload)
    setModalType(null)
    await fetchTeams()
  }

  const deleteDept = async () => {
    if (!selectedDeptRow?.dept_id) return alert('삭제할 부서를 선택하세요.')
    if (!confirm(`${selectedDeptRow.dept_name} 부서를 삭제할까요?`)) return
    await api.delete(`/depts/${selectedDeptRow.dept_id}`)
    setSelectedDeptId(null)
    setSelectedDeptRow(null)
    await refresh()
  }

  const deleteTeam = async () => {
    if (!selectedTeamRow?.team_id) return alert('삭제할 팀을 선택하세요.')
    if (!confirm(`${selectedTeamRow.team_name} 팀을 삭제할까요?`)) return
    await api.delete(`/teams/${selectedTeamRow.team_id}`)
    setSelectedTeamRow(null)
    await fetchTeams()
  }

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
      <PageHeader breadcrumb={['조직 관리', '부서/팀']} title="부서/팀 관리" description="조직의 부서 및 팀을 관리합니다." />

      <div className="panel-header" style={{ marginBottom: 12 }}>
        <input
          className="search-input"
          placeholder="부서/팀 검색..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') runSearch() }}
        />
        <button className="btn btn-secondary btn-sm" onClick={runSearch}>검색</button>
        <button className="btn btn-secondary btn-sm" onClick={refresh}>새로고침</button>
      </div>

      <div className="dept-layout">
        <div className="dept-panel">
          <div className="panel-header">
            <span className="panel-title-text">전체 &gt; 부서</span>
            <div className="panel-actions">
              <button className="btn btn-primary btn-sm" onClick={openNewDept}>신규</button>
              <button className="btn btn-secondary btn-sm" onClick={() => selectedDeptRow ? (setDeptForm(selectedDeptRow), setModalType('dept')) : alert('수정할 부서를 선택하세요.')}>수정</button>
              <button className="btn btn-secondary btn-sm" onClick={deleteDept}>삭제</button>
              <button className="btn btn-secondary btn-sm" onClick={refresh}>저장</button>
            </div>
          </div>
          <DataTable columns={deptColumns as any} data={depts as any} onSelectRow={(idx) => { setSelectedDeptId(depts[idx].dept_id!); setSelectedDeptRow(depts[idx]) }} />
        </div>

        <div className="dept-panel">
          <div className="panel-header">
            <span className="panel-title-text">{selectedDeptName} &gt; 팀</span>
            <div className="panel-actions">
              <button className="btn btn-primary btn-sm" onClick={openNewTeam}>신규</button>
              <button className="btn btn-secondary btn-sm" onClick={() => selectedTeamRow ? (setTeamForm(selectedTeamRow), setModalType('team')) : alert('수정할 팀을 선택하세요.')}>수정</button>
              <button className="btn btn-secondary btn-sm" onClick={deleteTeam}>삭제</button>
              <button className="btn btn-secondary btn-sm" onClick={() => fetchTeams()}>저장</button>
            </div>
          </div>
          <DataTable columns={teamColumns as any} data={teams as any} onSelectRow={(idx) => setSelectedTeamRow(teams[idx])} />
        </div>
      </div>

      {modalType === 'dept' && <Modal title="부서 입력" onClose={() => setModalType(null)} width="520px">
        <div className="modal-form" style={{ padding: 20, display: 'grid', gap: 10 }}>
          <label>부서명<input value={deptForm.dept_name} onChange={e => setDeptForm({ ...deptForm, dept_name: e.target.value })} /></label>
          <label>순서<input type="number" value={deptForm.sort_order} onChange={e => setDeptForm({ ...deptForm, sort_order: Number(e.target.value) })} /></label>
          <label>사용<select value={deptForm.is_used} onChange={e => setDeptForm({ ...deptForm, is_used: e.target.value })}><option value="Y">Y</option><option value="N">N</option></select></label>
          <label>적용일<input type="date" value={deptForm.apply_date || ''} onChange={e => setDeptForm({ ...deptForm, apply_date: e.target.value })} /></label>
          <button className="btn btn-primary" onClick={saveDept}>저장</button>
        </div>
      </Modal>}

      {modalType === 'team' && <Modal title="팀 입력" onClose={() => setModalType(null)} width="520px">
        <div className="modal-form" style={{ padding: 20, display: 'grid', gap: 10 }}>
          <label>부서<select value={teamForm.dept_id || selectedDeptId || ''} onChange={e => setTeamForm({ ...teamForm, dept_id: Number(e.target.value) })}>{depts.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}</select></label>
          <label>팀명<input value={teamForm.team_name} onChange={e => setTeamForm({ ...teamForm, team_name: e.target.value })} /></label>
          <label>순서<input type="number" value={teamForm.sort_order} onChange={e => setTeamForm({ ...teamForm, sort_order: Number(e.target.value) })} /></label>
          <label>사용<select value={teamForm.is_used} onChange={e => setTeamForm({ ...teamForm, is_used: e.target.value })}><option value="Y">Y</option><option value="N">N</option></select></label>
          <label>적용일<input type="date" value={teamForm.apply_date || ''} onChange={e => setTeamForm({ ...teamForm, apply_date: e.target.value })} /></label>
          <button className="btn btn-primary" onClick={saveTeam}>저장</button>
        </div>
      </Modal>}

      {historyTarget && <Modal title={`${historyTarget} 변경 이력`} onClose={() => setHistoryTarget(null)} width="650px"><div style={{ padding: 20, textAlign: 'center' }}>이력 조회 API 연동 예정</div></Modal>}
    </div>
  )
}
