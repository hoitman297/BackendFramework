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
  branch_id: number | null;
  department: string;
  team: string;
  rank: number | null;
  work_status: string;
  is_company: string;
}

interface Branch {
  branch_id: number;
  branch_name: string;
}

interface Department {
  dept_id: number;
  dept_name: string;
}

interface Team {
  team_id: number;
  team_name: string;
}

type UserForm = {
  user_name: string;
  user_password: string;
  email: string;
  phone: string;
  branch_id: number | null;
  department: string;
  team: string;
  rank: number | null;
  work_status: string;
  is_company: string;
}

const EMPTY_USER: UserForm = {
  user_name: '',
  user_password: '',
  email: '',
  phone: '',
  branch_id: null,
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
  const [branches, setBranches] = useState<Branch[]>([])
  const [depts, setDepts] = useState<Department[]>([])
  const [teamsByDept, setTeamsByDept] = useState<Record<number, Team[]>>({})
  const [search, setSearch] = useState('')

  const [filterBranch, setFilterBranch] = useState<number | ''>('')
  const [filterDept, setFilterDept] = useState('')
  const [filterTeam, setFilterTeam] = useState('')
  const [filterTeams, setFilterTeams] = useState<Team[]>([])

  const [showUserModal, setShowUserModal] = useState(false)
  const [editUserId, setEditUserId] = useState<number | null>(null)
  const [userForm, setUserForm] = useState<UserForm>(EMPTY_USER)
  const [modalTeams, setModalTeams] = useState<Team[]>([])

  const fetchBranches = async () => {
    try {
      const res = await api.get<Branch[]>('/branches')
      setBranches(res.data)
    } catch (err) { console.error(err) }
  }

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
      if (filterBranch !== '') query.append('branch_id', String(filterBranch))
      if (filterDept) query.append('department', filterDept)
      if (filterTeam) query.append('team', filterTeam)
      const res = await api.get<User[]>(`/users?${query.toString()}`)
      setUsers(res.data)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  useEffect(() => { fetchBranches(); fetchDepts() }, [])
  useEffect(() => { fetchUsers() }, [filterBranch, filterDept, filterTeam])

  const handleBranchFilter = (value: string) => {
    setFilterBranch(value === '' ? '' : Number(value))
    setFilterDept('')
    setFilterTeam('')
    setFilterTeams([])
  }

  const handleDeptFilter = async (deptName: string) => {
    setFilterDept(deptName)
    setFilterTeam('')
    if (deptName) {
      const dept = depts.find(d => d.dept_name === deptName)
      if (dept) {
        const teams = await fetchTeams(dept.dept_id)
        setFilterTeams(teams || [])
      }
    } else {
      setFilterTeams([])
    }
  }

  const filtered = users.filter(u =>
    !search ||
    u.user_name?.includes(search) ||
    u.email?.includes(search) ||
    u.phone?.includes(search)
  )

  const openCreate = () => {
    const nextForm = { ...EMPTY_USER }
    if (filterBranch !== '') nextForm.branch_id = Number(filterBranch)
    if (filterDept) nextForm.department = filterDept
    if (filterTeam) nextForm.team = filterTeam
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
      branch_id: user.branch_id ?? null,
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

  return (
    <div>
      <PageHeader breadcrumb={['조직 관리', '담당직원']} title="담당직원" description="직원 정보를 관리합니다." />

      <div className="employee-filter-bar">
        <div className="employee-filter-item">
          <label className="employee-filter-label">지점별 조회</label>
          <select
            className="employee-filter-select"
            value={filterBranch}
            onChange={e => handleBranchFilter(e.target.value)}
          >
            <option value="">전체</option>
            {branches.map(b => <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>)}
          </select>
        </div>
        <div className="employee-filter-item">
          <label className="employee-filter-label">부서별 조회</label>
          <select
            className="employee-filter-select"
            value={filterDept}
            onChange={e => handleDeptFilter(e.target.value)}
          >
            <option value="">전체</option>
            {depts.map(d => <option key={d.dept_id} value={d.dept_name}>{d.dept_name}</option>)}
          </select>
        </div>
        <div className="employee-filter-item">
          <label className="employee-filter-label">팀별 조회</label>
          <select
            className="employee-filter-select"
            value={filterTeam}
            onChange={e => setFilterTeam(e.target.value)}
            disabled={!filterDept}
          >
            <option value="">{filterDept ? '전체' : '부서를 먼저 선택하세요'}</option>
            {filterTeams.map(t => <option key={t.team_id} value={t.team_name}>{t.team_name}</option>)}
          </select>
        </div>
      </div>

      <ToolBar
        left={<input className="search-input" placeholder="이름, 아이디, 전화번호 검색..." value={search} onChange={e => setSearch(e.target.value)} />}
        buttons={[
          { label: '신규 등록', variant: 'primary', onClick: openCreate },
          { label: '새로고침', variant: 'secondary', onClick: fetchUsers },
        ]}
      />

      {loading ? (
        <div className="loading-state">로딩 중...</div>
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
              <input className="form-input" type="password" placeholder={editUserId ? '변경 시에만 입력' : '미입력 시 임시 비밀번호 자동 발급'} value={userForm.user_password} onChange={e => setUserForm(p => ({ ...p, user_password: e.target.value }))} />
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
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">지점</label>
              <select
                className="form-input"
                style={{ maxWidth: 'calc(50% - 6px)' }}
                value={userForm.branch_id ?? ''}
                onChange={e => setUserForm(p => ({ ...p, branch_id: e.target.value ? Number(e.target.value) : null }))}
              >
                <option value="">지점 선택</option>
                {branches.map(b => <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">부서</label>
              <select
                className="form-input"
                value={userForm.department}
                onChange={e => changeDepartment(e.target.value)}
              >
                <option value="">부서 선택</option>
                {depts.map(dept => <option key={dept.dept_id} value={dept.dept_name}>{dept.dept_name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">팀</label>
              <select
                className="form-input"
                value={userForm.team}
                onChange={e => setUserForm(p => ({ ...p, team: e.target.value }))}
                disabled={!userForm.department}
              >
                <option value="">{userForm.department ? '팀 선택' : '부서를 먼저 선택하세요'}</option>
                {modalTeams.map(team => <option key={team.team_id} value={team.team_name}>{team.team_name}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">재직 상태</label>
              <select className="form-input" style={{ maxWidth: 'calc(50% - 6px)' }} value={userForm.work_status} onChange={e => setUserForm(p => ({ ...p, work_status: e.target.value }))}>
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
