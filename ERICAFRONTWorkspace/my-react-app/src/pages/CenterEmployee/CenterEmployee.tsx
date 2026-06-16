import { useState, useEffect } from 'react'
import PageHeader from '../../components/common/PageHeader'
import ToolBar from '../../components/common/ToolBar'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import Modal from '../../components/common/Modal'
import Toast, { useToast } from '../../components/common/Toast'
import { api } from '../../services/api'
import './CenterEmployee.css'

interface User {
  user_id: number;
  user_name: string;
  is_deleted: string;
  user_password?: string;
  email: string;
  phone: string;
  department: string;
  team: string;
  rank: number | null;
  work_status: string;
  is_company: string;
}

interface Department {
  dept_id: number;
  dept_name: string;
}

interface Team {
  team_id: number;
  team_name: string;
}

type TreeSelection =
  | { type: 'all' }
  | { type: 'dept'; deptId: number; deptName: string }
  | { type: 'team'; deptId: number; teamName: string }

type UserForm = {
  user_name: string;
  user_password: string;
  email: string;
  phone: string;
  department: string;
  team: string;
  rank: number | null;
  work_status: string;
  is_company: string;
}

const EMPTY_USER: UserForm = {
  user_name: '',
  user_password: '1234',
  email: '',
  phone: '',
  department: '',
  team: '',
  rank: 1,
  work_status: '재직',
  is_company: 'Y',
}

const RANK_OPTIONS = [
  { value: 1, label: '직원' },
  { value: 2, label: '지점장' },
  { value: 3, label: '어드민' },
]

const getRankLabel = (rank: number | null | undefined) => {
  const option = RANK_OPTIONS.find(item => item.value === Number(rank))
  return option ? option.label : '-'
}

export default function CenterEmployee() {
  const { toast, showToast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [depts, setDepts] = useState<Department[]>([])
  const [teamsByDept, setTeamsByDept] = useState<Record<number, Team[]>>({})
  const [expandedDepts, setExpandedDepts] = useState<Set<number>>(new Set())
  const [treeSelection, setTreeSelection] = useState<TreeSelection>({ type: 'all' })
  const [isCompanyFilter, setIsCompanyFilter] = useState('전체')
  const [search, setSearch] = useState('')
  const [showUserModal, setShowUserModal] = useState(false)
  const [editUserId, setEditUserId] = useState<number | null>(null)
  const [userForm, setUserForm] = useState<UserForm>(EMPTY_USER)
  const [modalTeams, setModalTeams] = useState<Team[]>([])

  const fetchDepts = async () => {
    try {
      const res = await api.get<Department[]>('/depts')
      setDepts(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchTeams = async (deptId: number) => {
    if (teamsByDept[deptId]) return teamsByDept[deptId]
    try {
      const res = await api.get<Team[]>(`/teams?dept_id=${deptId}`)
      setTeamsByDept(prev => ({ ...prev, [deptId]: res.data }))
      return res.data
    } catch (err) { console.error(err); return [] }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      if (isCompanyFilter === '기업') query.append('is_company', 'Y')
      else if (isCompanyFilter === '개인') query.append('is_company', 'N')

      if (treeSelection.type === 'dept') {
        query.append('department', treeSelection.deptName)
      } else if (treeSelection.type === 'team') {
        query.append('team', treeSelection.teamName)
      }

      const res = await api.get<User[]>(`/users?${query.toString()}`)
      setUsers(res.data)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  useEffect(() => { fetchDepts() }, [])
  useEffect(() => { fetchUsers() }, [isCompanyFilter, treeSelection])

  const toggleDept = (deptId: number) => {
    setExpandedDepts(prev => {
      const next = new Set(prev)
      if (next.has(deptId)) { next.delete(deptId) } else {
        next.add(deptId)
        fetchTeams(deptId)
      }
      return next
    })
  }

  const filtered = users.filter(u =>
    !search ||
    u.user_name?.includes(search) ||
    u.email?.includes(search) ||
    u.phone?.includes(search)
  )

  const openCreate = () => {
    const nextForm = { ...EMPTY_USER }
    if (treeSelection.type === 'dept') nextForm.department = treeSelection.deptName
    if (treeSelection.type === 'team') {
      const dept = depts.find(d => d.dept_id === treeSelection.deptId)
      nextForm.department = dept?.dept_name || ''
      nextForm.team = treeSelection.teamName
    }
    if (isCompanyFilter === '기업') nextForm.is_company = 'Y'
    if (isCompanyFilter === '개인') nextForm.is_company = 'N'
    setEditUserId(null)
    setUserForm(nextForm)
    setShowUserModal(true)
    loadModalTeams(nextForm.department)
  }

  const openEdit = (user: User) => {
    setEditUserId(user.user_id)
    const nextForm = {
      user_name: user.user_name || '',
      user_password: '',
      email: user.email || '',
      phone: user.phone || '',
      department: user.department || '',
      team: user.team || '',
      rank: user.rank ?? 1,
      work_status: user.work_status || '재직',
      is_company: user.is_company || 'Y',
    }
    setUserForm(nextForm)
    setShowUserModal(true)
    loadModalTeams(nextForm.department)
  }

  const loadModalTeams = async (deptName: string) => {
    const dept = depts.find(d => d.dept_name === deptName)
    if (!dept) { setModalTeams([]); return }
    const teams = await fetchTeams(dept.dept_id)
    setModalTeams(teams || [])
  }

  const changeDepartment = async (deptName: string) => {
    setUserForm(prev => ({ ...prev, department: deptName, team: '' }))
    await loadModalTeams(deptName)
  }

  const saveUser = async () => {
    if (!userForm.user_name.trim()) { showToast('직원명을 입력해 주세요.', 'error'); return }
    if (!userForm.email.trim()) { showToast('아이디/이메일을 입력해 주세요.', 'error'); return }
    if (!userForm.phone.trim()) { showToast('전화번호를 입력해 주세요.', 'error'); return }

    const body: any = { ...userForm }
    if (editUserId && !body.user_password) delete body.user_password

    try {
      if (editUserId) {
        await api.patch(`/users/${editUserId}`, body)
        showToast('직원 정보가 수정되었습니다.', 'success')
      } else {
        await api.post('/users', body)
        showToast('직원이 등록되었습니다.', 'success')
      }
      setShowUserModal(false)
      fetchUsers()
    } catch (err) { console.error(err); showToast('저장 실패', 'error') }
  }

  const deleteUser = async (user: User) => {
    if (!confirm(`"${user.user_name}" 직원을 삭제하시겠습니까?`)) return
    try {
      await api.delete(`/users/${user.user_id}`)
      showToast('삭제되었습니다.', 'success')
      fetchUsers()
    } catch (err) { console.error(err); showToast('삭제 실패', 'error') }
  }

  const columns = [
    { key: 'no', label: 'No', width: '50px' },
    { key: 'user_name', label: '이름' },
    { key: 'department', label: '부서' },
    { key: 'team', label: '팀' },
    { key: 'rank_label', label: '직급' },
    { key: 'work_status', label: '상태', render: (v: any) => <StatusBadge status={String(v || '재직')} /> },
    { key: 'email', label: '아이디' },
    { key: 'phone', label: '전화번호' },
    { key: 'is_company_label', label: '구분' },
    { key: 'actions', label: '관리', width: '110px', render: (_: any, row: any) => (
      <div className="employee-actions">
        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(row)}>수정</button>
        <button className="btn btn-danger btn-sm" onClick={() => deleteUser(row)}>삭제</button>
      </div>
    ) },
  ]

  const isSelected = (sel: TreeSelection) => {
    if (treeSelection.type !== sel.type) return false
    if (sel.type === 'all') return true
    if (sel.type === 'dept' && treeSelection.type === 'dept') return treeSelection.deptId === sel.deptId
    if (sel.type === 'team' && treeSelection.type === 'team') return treeSelection.teamName === sel.teamName
    return false
  }

  return (
    <div>
      <PageHeader breadcrumb={['조직 관리', '센터 담당직원']} title="센터 담당직원" description="센터 직원 정보를 관리합니다." />
      <div className="employee-layout">
        <aside className="tree-panel">
          <div className="filter-group" style={{padding: '10px', borderBottom: '1px solid #eee'}}>
            <p style={{fontSize: '12px', fontWeight: 'bold', marginBottom: '8px'}}>사용자 구분</p>
            {['전체', '개인', '기업'].map(f => (
              <label key={f} style={{display: 'block', fontSize: '13px', marginBottom: '4px', cursor: 'pointer'}}>
                <input type="radio" checked={isCompanyFilter === f} onChange={() => setIsCompanyFilter(f)} /> {f}
              </label>
            ))}
          </div>
          <p className="panel-title">부서 &gt; 팀</p>
          <div
            className={`tree-node${isSelected({ type: 'all' }) ? ' active' : ''}`}
            style={{ paddingLeft: '12px' }}
            onClick={() => setTreeSelection({ type: 'all' })}>
            전체
          </div>
          {depts.map(dept => (
            <div key={dept.dept_id}>
              <div
                className={`tree-node${isSelected({ type: 'dept', deptId: dept.dept_id, deptName: dept.dept_name }) ? ' active' : ''}`}
                style={{ paddingLeft: '12px' }}
                onClick={() => {
                  setTreeSelection({ type: 'dept', deptId: dept.dept_id, deptName: dept.dept_name })
                  toggleDept(dept.dept_id)
                }}>
                <span style={{ marginRight: '4px' }}>{expandedDepts.has(dept.dept_id) ? '▾' : '▸'}</span>
                {dept.dept_name}
              </div>
              {expandedDepts.has(dept.dept_id) && (teamsByDept[dept.dept_id] || []).map(team => (
                <div
                  key={team.team_id}
                  className={`tree-node${isSelected({ type: 'team', deptId: dept.dept_id, teamName: team.team_name }) ? ' active' : ''}`}
                  style={{ paddingLeft: '28px' }}
                  onClick={() => setTreeSelection({ type: 'team', deptId: dept.dept_id, teamName: team.team_name })}>
                  {team.team_name}
                </div>
              ))}
            </div>
          ))}
        </aside>
        <div className="employee-main">
          <ToolBar
            left={<input className="search-input" placeholder="이름, 아이디, 전화번호 검색..." value={search} onChange={e => setSearch(e.target.value)} />}
            buttons={[
              { label: '신규 등록', variant: 'primary', onClick: openCreate },
              { label: '새로고침', variant: 'secondary', onClick: fetchUsers },
            ]}
          />
          {loading ? (
            <div>로딩 중...</div>
          ) : (
            <DataTable
              columns={columns as any}
              data={filtered.map((u, i) => ({
                ...u,
                no: i + 1,
                is_company_label: u.is_company === 'Y' ? '기업' : '개인',
                rank_label: getRankLabel(u.rank),
              })) as any}
            />
          )}
          <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '8px', textAlign: 'right' }}>총 {filtered.length}건</p>
        </div>
      </div>

      {showUserModal && (
        <Modal title={editUserId ? '직원 정보 수정' : '직원 신규 등록'} onClose={() => setShowUserModal(false)} width="560px">
          <div className="employee-form-grid">
            <div>
              <label className="form-label">직원명 <span style={{color:'red'}}>*</span></label>
              <input className="form-input" value={userForm.user_name} onChange={e => setUserForm(p => ({ ...p, user_name: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">사용자 구분</label>
              <select className="form-input" value={userForm.is_company} onChange={e => setUserForm(p => ({ ...p, is_company: e.target.value }))}>
                <option value="Y">기업</option>
                <option value="N">개인</option>
              </select>
            </div>
            <div>
              <label className="form-label">아이디/이메일 <span style={{color:'red'}}>*</span></label>
              <input className="form-input" value={userForm.email} onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">비밀번호{editUserId ? ' 변경' : ''}</label>
              <input className="form-input" type="password" placeholder={editUserId ? '변경 시에만 입력' : '기본값 1234'} value={userForm.user_password} onChange={e => setUserForm(p => ({ ...p, user_password: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">전화번호 <span style={{color:'red'}}>*</span></label>
              <input className="form-input" value={userForm.phone} onChange={e => setUserForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">직급</label>
              <select
                className="form-input"
                value={userForm.rank ?? 1}
                onChange={e => setUserForm(p => ({ ...p, rank: Number(e.target.value) }))}
              >
                {RANK_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">부서</label>
              <select className="form-input" value={userForm.department} onChange={e => changeDepartment(e.target.value)}>
                <option value="">부서 선택</option>
                {depts.map(dept => <option key={dept.dept_id} value={dept.dept_name}>{dept.dept_name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">팀</label>
              <select className="form-input" value={userForm.team} onChange={e => setUserForm(p => ({ ...p, team: e.target.value }))}>
                <option value="">팀 선택</option>
                {modalTeams.map(team => <option key={team.team_id} value={team.team_name}>{team.team_name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">재직 상태</label>
              <select className="form-input" value={userForm.work_status} onChange={e => setUserForm(p => ({ ...p, work_status: e.target.value }))}>
                <option value="재직">재직</option>
                <option value="휴직">휴직</option>
                <option value="퇴직">퇴직</option>
              </select>
            </div>
          </div>
          <div className="employee-modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowUserModal(false)}>취소</button>
            <button className="btn btn-primary" onClick={saveUser}>저장</button>
          </div>
        </Modal>
      )}

      <Toast {...toast} />
    </div>
  )
}
