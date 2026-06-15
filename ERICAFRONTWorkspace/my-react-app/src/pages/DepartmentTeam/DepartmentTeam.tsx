import { useState, useEffect } from 'react'
import PageHeader from '../../components/common/PageHeader'
import Modal from '../../components/common/Modal'
import { api } from '../../services/api'
import Toast, { useToast } from '../../components/common/Toast'
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

const EMPTY_DEPT = { dept_name: '', sort_order: 1, is_used: 'Y', apply_date: '' }
const EMPTY_TEAM = { team_name: '', sort_order: 1, is_used: 'Y', apply_date: '' }

export default function DepartmentTeam() {
  const { toast, showToast } = useToast()
  const [depts, setDepts] = useState<Department[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)

  const [deptForm, setDeptForm] = useState(EMPTY_DEPT)
  const [teamForm, setTeamForm] = useState(EMPTY_TEAM)
  const [showDeptModal, setShowDeptModal] = useState(false)
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [editDeptId, setEditDeptId] = useState<number | null>(null)
  const [editTeamId, setEditTeamId] = useState<number | null>(null)

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

  // 부서 모달 열기
  const openDeptCreate = () => {
    setEditDeptId(null)
    setDeptForm(EMPTY_DEPT)
    setShowDeptModal(true)
  }

  const openDeptEdit = (dept: Department) => {
    setEditDeptId(dept.dept_id)
    setDeptForm({
      dept_name: dept.dept_name,
      sort_order: dept.sort_order,
      is_used: dept.is_used,
      apply_date: dept.apply_date || '',
    })
    setShowDeptModal(true)
  }

  const saveDept = async () => {
    if (!deptForm.dept_name.trim()) { showToast('부서명을 입력해 주세요.', 'error'); return }
    const body: any = { ...deptForm }
    if (body.apply_date) body.apply_date = body.apply_date + 'T00:00:00'
    try {
      if (editDeptId) {
        await api.patch(`/depts/${editDeptId}`, body)
        showToast('수정되었습니다.', 'success')
      } else {
        await api.post('/depts', body)
        showToast('등록되었습니다.', 'success')
      }
      setShowDeptModal(false)
      fetchDepts()
    } catch (err) { console.error(err); showToast('저장 실패', 'error') }
  }

  const deleteDept = async (dept: Department) => {
    if (!confirm(`"${dept.dept_name}" 부서를 삭제하시겠습니까?`)) return
    try {
      await api.delete(`/depts/${dept.dept_id}`)
      if (selectedDeptId === dept.dept_id) { setSelectedDeptId(null); setTeams([]) }
      fetchDepts()
    } catch (err) { console.error(err); showToast('삭제 실패', 'error') }
  }

  // 팀 모달 열기
  const openTeamCreate = () => {
    if (!selectedDeptId) { showToast('먼저 부서를 선택해 주세요.', 'error'); return }
    setEditTeamId(null)
    setTeamForm(EMPTY_TEAM)
    setShowTeamModal(true)
  }

  const openTeamEdit = (team: Team) => {
    setEditTeamId(team.team_id)
    setTeamForm({
      team_name: team.team_name,
      sort_order: team.sort_order,
      is_used: team.is_used,
      apply_date: team.apply_date || '',
    })
    setShowTeamModal(true)
  }

  const saveTeam = async () => {
    if (!teamForm.team_name.trim()) { showToast('팀명을 입력해 주세요.', 'error'); return }
    const body: any = {
      ...teamForm,
      department: { dept_id: selectedDeptId },
    }
    if (body.apply_date) body.apply_date = body.apply_date + 'T00:00:00'
    try {
      if (editTeamId) {
        await api.patch(`/teams/${editTeamId}`, body)
        showToast('수정되었습니다.', 'success')
      } else {
        await api.post('/teams', body)
        showToast('등록되었습니다.', 'success')
      }
      setShowTeamModal(false)
      if (selectedDeptId) fetchTeams(selectedDeptId)
    } catch (err) { console.error(err); showToast('저장 실패', 'error') }
  }

  const deleteTeam = async (team: Team) => {
    if (!confirm(`"${team.team_name}" 팀을 삭제하시겠습니까?`)) return
    try {
      await api.delete(`/teams/${team.team_id}`)
      if (selectedTeamId === team.team_id) setSelectedTeamId(null)
      if (selectedDeptId) fetchTeams(selectedDeptId)
    } catch (err) { console.error(err); showToast('삭제 실패', 'error') }
  }

  const selectedDeptName = depts.find(d => d.dept_id === selectedDeptId)?.dept_name || ''

  return (
    <div>
      <PageHeader
        breadcrumb={['조직 관리', '부서/팀']}
        title="부서/팀 관리"
        description="조직의 부서 및 팀을 관리합니다."
      />

      <div className="dept-layout">
        {/* 부서 패널 */}
        <div className="dept-panel">
          <div className="panel-header">
            <span className="panel-title-text">전체 &gt; 부서</span>
            <div className="panel-actions">
              <button className="btn btn-primary btn-sm" onClick={openDeptCreate}>신규</button>
            </div>
          </div>
          <table className="inner-table">
            <thead>
              <tr>
                <th style={{width:'50px'}}>순서</th>
                <th style={{width:'50px'}}>이력</th>
                <th>부서명</th>
                <th style={{width:'90px'}}>생성적용일</th>
                <th style={{width:'40px'}}>사용</th>
                <th style={{width:'80px'}}>관리</th>
              </tr>
            </thead>
            <tbody>
              {depts.length === 0 && (
                <tr><td colSpan={6} className="empty-cell">부서 없음</td></tr>
              )}
              {depts.map(dept => (
                <tr key={dept.dept_id}
                    className={selectedDeptId === dept.dept_id ? 'selected' : ''}
                    onClick={() => setSelectedDeptId(dept.dept_id)}>
                  <td>{dept.sort_order}</td>
                  <td>
                    <button className="link-btn" onClick={e => { e.stopPropagation(); setHistoryTarget(dept.dept_name) }}>이력</button>
                  </td>
                  <td>{dept.dept_name}</td>
                  <td>{dept.apply_date ? String(dept.apply_date).slice(0, 10) : '-'}</td>
                  <td><span className={`toggle ${dept.is_used === 'Y' ? 'on' : 'off'}`}>{dept.is_used === 'Y' ? 'ON' : 'OFF'}</span></td>
                  <td style={{display:'flex', gap:'4px'}}>
                    <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); openDeptEdit(dept) }}>수정</button>
                    <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); deleteDept(dept) }}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 팀 패널 */}
        <div className="dept-panel">
          <div className="panel-header">
            <span className="panel-title-text">{selectedDeptName || '부서 선택'} &gt; 팀</span>
            <div className="panel-actions">
              <button className="btn btn-primary btn-sm" onClick={openTeamCreate}>신규</button>
            </div>
          </div>
          <table className="inner-table">
            <thead>
              <tr>
                <th style={{width:'50px'}}>순서</th>
                <th style={{width:'50px'}}>이력</th>
                <th>팀명</th>
                <th style={{width:'90px'}}>생성적용일</th>
                <th style={{width:'40px'}}>사용</th>
                <th style={{width:'80px'}}>관리</th>
              </tr>
            </thead>
            <tbody>
              {!selectedDeptId && (
                <tr><td colSpan={6} className="empty-cell">왼쪽에서 부서를 선택하세요.</td></tr>
              )}
              {selectedDeptId && teams.length === 0 && (
                <tr><td colSpan={6} className="empty-cell">팀 없음</td></tr>
              )}
              {teams.map(team => (
                <tr key={team.team_id}
                    className={selectedTeamId === team.team_id ? 'selected' : ''}
                    onClick={() => setSelectedTeamId(team.team_id)}>
                  <td>{team.sort_order}</td>
                  <td>
                    <button className="link-btn" onClick={e => { e.stopPropagation(); setHistoryTarget(team.team_name) }}>이력</button>
                  </td>
                  <td>{team.team_name}</td>
                  <td>{team.apply_date ? String(team.apply_date).slice(0, 10) : '-'}</td>
                  <td><span className={`toggle ${team.is_used === 'Y' ? 'on' : 'off'}`}>{team.is_used === 'Y' ? 'ON' : 'OFF'}</span></td>
                  <td style={{display:'flex', gap:'4px'}}>
                    <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); openTeamEdit(team) }}>수정</button>
                    <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); deleteTeam(team) }}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 부서 신규/수정 모달 */}
      {showDeptModal && (
        <Modal title={editDeptId ? '부서 수정' : '부서 신규 등록'} onClose={() => setShowDeptModal(false)} width="420px">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">부서명 <span style={{color:'red'}}>*</span></label>
              <input className="form-input" value={deptForm.dept_name} onChange={e => setDeptForm(p => ({ ...p, dept_name: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">정렬순서</label>
              <input className="form-input" type="number" value={deptForm.sort_order} onChange={e => setDeptForm(p => ({ ...p, sort_order: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="form-label">사용여부</label>
              <select className="form-input" value={deptForm.is_used} onChange={e => setDeptForm(p => ({ ...p, is_used: e.target.value }))}>
                <option value="Y">사용</option>
                <option value="N">미사용</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">생성적용일</label>
              <input className="form-input" type="date" value={deptForm.apply_date ? String(deptForm.apply_date).slice(0, 10) : ''} onChange={e => setDeptForm(p => ({ ...p, apply_date: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowDeptModal(false)}>취소</button>
            <button className="btn btn-primary" onClick={saveDept}>저장</button>
          </div>
        </Modal>
      )}

      {/* 팀 신규/수정 모달 */}
      {showTeamModal && (
        <Modal title={editTeamId ? '팀 수정' : '팀 신규 등록'} onClose={() => setShowTeamModal(false)} width="420px">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">팀명 <span style={{color:'red'}}>*</span></label>
              <input className="form-input" value={teamForm.team_name} onChange={e => setTeamForm(p => ({ ...p, team_name: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">정렬순서</label>
              <input className="form-input" type="number" value={teamForm.sort_order} onChange={e => setTeamForm(p => ({ ...p, sort_order: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="form-label">사용여부</label>
              <select className="form-input" value={teamForm.is_used} onChange={e => setTeamForm(p => ({ ...p, is_used: e.target.value }))}>
                <option value="Y">사용</option>
                <option value="N">미사용</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">생성적용일</label>
              <input className="form-input" type="date" value={teamForm.apply_date ? String(teamForm.apply_date).slice(0, 10) : ''} onChange={e => setTeamForm(p => ({ ...p, apply_date: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowTeamModal(false)}>취소</button>
            <button className="btn btn-primary" onClick={saveTeam}>저장</button>
          </div>
        </Modal>
      )}

      {historyTarget && (
        <Modal title={`${historyTarget} 변경 이력`} onClose={() => setHistoryTarget(null)} width="650px">
          <div style={{padding: '20px', textAlign: 'center', color: 'var(--text-light)'}}>변경 이력 기능은 준비 중입니다.</div>
        </Modal>
      )}

      <Toast {...toast} />
    </div>
  )
}
