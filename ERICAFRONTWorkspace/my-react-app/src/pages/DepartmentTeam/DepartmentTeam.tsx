import { useState, useEffect } from 'react'
import PageHeader from '../../components/common/PageHeader'
import Modal from '../../components/common/Modal'
import { api } from '../../services/api'
import Toast, { useToast } from '../../components/common/Toast'
import './DepartmentTeam.css'

interface Branch {
  branch_id: number
  branch_name: string
}

interface Department {
  dept_id: number
  branch_id: number | null
  dept_name: string
  sort_order: number
  is_used: string
  apply_date: string
}

interface Team {
  team_id: number
  team_name: string
  sort_order: number
  is_used: string
  apply_date: string
}

const EMPTY_DEPT = { dept_name: '', sort_order: 1, is_used: 'Y', apply_date: '' }
const EMPTY_TEAM = { team_name: '', sort_order: 1, is_used: 'Y', apply_date: '' }

export default function DepartmentTeam() {
  const { toast, showToast } = useToast()

  const [branches, setBranches] = useState<Branch[]>([])
  const [depts, setDepts] = useState<Department[]>([])
  const [teams, setTeams] = useState<Team[]>([])

  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null)
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null)

  const [deptForm, setDeptForm] = useState(EMPTY_DEPT)
  const [teamForm, setTeamForm] = useState(EMPTY_TEAM)
  const [showDeptModal, setShowDeptModal] = useState(false)
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [editDeptId, setEditDeptId] = useState<number | null>(null)
  const [editTeamId, setEditTeamId] = useState<number | null>(null)

  const fetchBranches = async () => {
    try {
      const res = await api.get<Branch[]>('/branches')
      setBranches(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchDepts = async (branchId: number) => {
    try {
      const res = await api.get<Department[]>(`/depts?branch_id=${branchId}`)
      setDepts(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchTeams = async (deptId: number) => {
    try {
      const res = await api.get<Team[]>(`/teams?dept_id=${deptId}`)
      setTeams(res.data)
    } catch (err) { console.error(err) }
  }

  useEffect(() => { fetchBranches() }, [])

  const selectBranch = (branchId: number) => {
    setSelectedBranchId(branchId)
    setSelectedDeptId(null)
    setTeams([])
    fetchDepts(branchId)
  }

  const selectDept = (deptId: number) => {
    setSelectedDeptId(deptId)
    fetchTeams(deptId)
  }

  // ── 부서 ──────────────────────────────────────────────
  const openDeptCreate = () => {
    if (!selectedBranchId) { showToast('먼저 지점을 선택해 주세요.', 'error'); return }
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
    const body: any = { ...deptForm, branch_id: selectedBranchId }
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
      if (selectedBranchId) fetchDepts(selectedBranchId)
    } catch (err) { console.error(err); showToast('저장 실패', 'error') }
  }

  const deleteDept = async (dept: Department) => {
    if (!confirm(`"${dept.dept_name}" 부서를 삭제하시겠습니까?`)) return
    try {
      await api.delete(`/depts/${dept.dept_id}`)
      if (selectedDeptId === dept.dept_id) { setSelectedDeptId(null); setTeams([]) }
      if (selectedBranchId) fetchDepts(selectedBranchId)
    } catch (err) { console.error(err); showToast('삭제 실패', 'error') }
  }

  // ── 팀 ───────────────────────────────────────────────
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
    const body: any = { ...teamForm, department: { dept_id: selectedDeptId } }
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
      if (selectedDeptId) fetchTeams(selectedDeptId)
    } catch (err) { console.error(err); showToast('삭제 실패', 'error') }
  }

  const selectedBranchName = branches.find(b => b.branch_id === selectedBranchId)?.branch_name || ''
  const selectedDeptName   = depts.find(d => d.dept_id === selectedDeptId)?.dept_name || ''

  const panelCols = [
    {
      title: '전체 > 지점',
      onNew: undefined as (() => void) | undefined,
      content: (
        <table className="inner-table">
          <thead>
            <tr>
              <th>지점명</th>
              <th style={{width:'60px'}}>부서 수</th>
            </tr>
          </thead>
          <tbody>
            {branches.length === 0 && <tr><td colSpan={2} className="empty-cell">지점 없음</td></tr>}
            {branches.map(b => (
              <tr
                key={b.branch_id}
                className={selectedBranchId === b.branch_id ? 'selected' : ''}
                onClick={() => selectBranch(b.branch_id)}
              >
                <td>{b.branch_name}</td>
                <td style={{textAlign:'center'}}>{depts.filter(d => d.branch_id === b.branch_id).length || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    },
    {
      title: selectedBranchName ? `${selectedBranchName} > 부서` : '지점 선택 > 부서',
      onNew: openDeptCreate,
      content: (
        <table className="inner-table">
          <thead>
            <tr>
              <th style={{width:'45px'}}>순서</th>
              <th>부서명</th>
              <th style={{width:'40px'}}>사용</th>
              <th style={{width:'75px'}}>관리</th>
            </tr>
          </thead>
          <tbody>
            {!selectedBranchId && <tr><td colSpan={4} className="empty-cell">왼쪽에서 지점을 선택하세요.</td></tr>}
            {selectedBranchId && depts.length === 0 && <tr><td colSpan={4} className="empty-cell">부서 없음</td></tr>}
            {depts.map(dept => (
              <tr
                key={dept.dept_id}
                className={selectedDeptId === dept.dept_id ? 'selected' : ''}
                onClick={() => selectDept(dept.dept_id)}
              >
                <td>{dept.sort_order}</td>
                <td>{dept.dept_name}</td>
                <td><span className={`toggle ${dept.is_used === 'Y' ? 'on' : 'off'}`}>{dept.is_used === 'Y' ? 'ON' : 'OFF'}</span></td>
                <td style={{display:'flex', gap:'4px'}}>
                  <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); openDeptEdit(dept) }}>수정</button>
                  <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); deleteDept(dept) }}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    },
    {
      title: selectedDeptName ? `${selectedDeptName} > 팀` : '부서 선택 > 팀',
      onNew: openTeamCreate,
      content: (
        <table className="inner-table">
          <thead>
            <tr>
              <th style={{width:'45px'}}>순서</th>
              <th>팀명</th>
              <th style={{width:'40px'}}>사용</th>
              <th style={{width:'75px'}}>관리</th>
            </tr>
          </thead>
          <tbody>
            {!selectedDeptId && <tr><td colSpan={4} className="empty-cell">왼쪽에서 부서를 선택하세요.</td></tr>}
            {selectedDeptId && teams.length === 0 && <tr><td colSpan={4} className="empty-cell">팀 없음</td></tr>}
            {teams.map(team => (
              <tr key={team.team_id}>
                <td>{team.sort_order}</td>
                <td>{team.team_name}</td>
                <td><span className={`toggle ${team.is_used === 'Y' ? 'on' : 'off'}`}>{team.is_used === 'Y' ? 'ON' : 'OFF'}</span></td>
                <td style={{display:'flex', gap:'4px'}}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openTeamEdit(team)}>수정</button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteTeam(team)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        breadcrumb={['조직 관리', '부서/팀']}
        title="부서/팀 관리"
        description="지점 > 부서 > 팀 계층 구조를 관리합니다."
      />

      <div className="dept-layout">
        {panelCols.map((col) => (
          <div className="dept-panel" key={col.title}>
            <div className="panel-header">
              <span className="panel-title-text">{col.title}</span>
              {col.onNew && (
                <div className="panel-actions">
                  <button className="btn btn-primary btn-sm" onClick={col.onNew}>신규</button>
                </div>
              )}
            </div>
            {col.content}
          </div>
        ))}
      </div>

      {/* 부서 모달 */}
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

      {/* 팀 모달 */}
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

      <Toast {...toast} />
    </div>
  )
}
