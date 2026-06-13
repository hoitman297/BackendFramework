import { useState, useEffect } from 'react'
import PageHeader from '../../components/common/PageHeader'
import ToolBar from '../../components/common/ToolBar'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import { api } from '../../services/api'
import './CenterEmployee.css'

interface User {
  user_id: number;
  user_name: string;
  is_deleted: string;
  email: string;
  phone: string;
  department: string;
  team: string;
  rank: string;
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

export default function CenterEmployee() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [depts, setDepts] = useState<Department[]>([])
  const [teamsByDept, setTeamsByDept] = useState<Record<number, Team[]>>({})
  const [expandedDepts, setExpandedDepts] = useState<Set<number>>(new Set())
  const [treeSelection, setTreeSelection] = useState<TreeSelection>({ type: 'all' })
  const [isCompanyFilter, setIsCompanyFilter] = useState('전체')
  const [search, setSearch] = useState('')

  const fetchDepts = async () => {
    try {
      const res = await api.get<Department[]>('/depts')
      setDepts(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchTeams = async (deptId: number) => {
    if (teamsByDept[deptId]) return
    try {
      const res = await api.get<Team[]>(`/teams?dept_id=${deptId}`)
      setTeamsByDept(prev => ({ ...prev, [deptId]: res.data }))
    } catch (err) { console.error(err) }
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
    !search || u.user_name?.includes(search) || u.email?.includes(search)
  )

  const columns = [
    { key: 'no', label: 'No', width: '50px' },
    { key: 'user_name', label: '이름' },
    { key: 'department', label: '부서' },
    { key: 'team', label: '팀' },
    { key: 'rank', label: '직급' },
    { key: 'work_status', label: '상태', render: (v: any) => <StatusBadge status={String(v || '근무')} /> },
    { key: 'email', label: '이메일' },
    { key: 'phone', label: '전화번호' },
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
          {/* 전체 */}
          <div
            className={`tree-node${isSelected({ type: 'all' }) ? ' active' : ''}`}
            style={{ paddingLeft: '12px' }}
            onClick={() => setTreeSelection({ type: 'all' })}>
            전체
          </div>
          {/* 부서 트리 */}
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
            left={<input className="search-input" placeholder="이름, 이메일 검색..." value={search} onChange={e => setSearch(e.target.value)} />}
            buttons={[{ label: '새로고침', variant: 'secondary', onClick: fetchUsers }]}
          />
          {loading ? (
            <div>로딩 중...</div>
          ) : (
            <DataTable
              columns={columns as any}
              data={filtered.map((u, i) => ({ ...u, no: i + 1 })) as any}
            />
          )}
          <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '8px', textAlign: 'right' }}>총 {filtered.length}건</p>
        </div>
      </div>
    </div>
  )
}
