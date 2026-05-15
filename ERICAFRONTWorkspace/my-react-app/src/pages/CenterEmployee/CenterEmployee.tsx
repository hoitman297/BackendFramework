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

interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
}

const treeData: TreeNode[] = [
  { id: '경영', label: '경영', children: [{ id: '경영관리', label: '경영관리팀' }, { id: '경영지원', label: '경영지원팀' }] },
  { id: '기술', label: '기술', children: [{ id: '개발', label: '개발팀' }, { id: 'QA', label: 'QA팀' }] },
]

function TreeItem({ node, selected, onSelect, depth = 0 }: any) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <div className={`tree-node${selected === node.id ? ' active' : ''}`} style={{ paddingLeft: `${12 + depth * 16}px` }} onClick={() => { onSelect(node.id); if (node.children) setOpen(!open) }}>
        {node.children && <span>{open ? '▾' : '▸'}</span>} {node.label}
      </div>
      {open && node.children?.map((c: any) => <TreeItem key={c.id} node={c} selected={selected} onSelect={onSelect} depth={depth + 1} />)}
    </div>
  )
}

export default function CenterEmployee() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isCompanyFilter, setIsCompanyFilter] = useState('전체')
  const [search, setSearch] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      if (isCompanyFilter === '기업') query.append('is_company', 'Y')
      else if (isCompanyFilter === '개인') query.append('is_company', 'N')
      
      if (selectedNode) {
        // 간단한 로직: ID와 매칭되는 부서 혹은 팀 검색
        if (['경영', '기술'].includes(selectedNode)) query.append('department', selectedNode)
        else query.append('team', selectedNode)
      }

      const res = await api.get<User[]>(`/users?${query.toString()}`)
      setUsers(res.data)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [isCompanyFilter, selectedNode])

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

  return (
    <div>
      <PageHeader breadcrumb={['조직 관리', '센터 담당직원']} title="센터 담당직원" description="센터 직원 정보를 관리합니다." />
      <div className="employee-layout">
        <aside className="tree-panel">
          <p className="panel-title">필터</p>
          <div className="filter-group" style={{padding: '10px', borderBottom: '1px solid #eee'}}>
             <p style={{fontSize: '12px', fontWeight: 'bold', marginBottom: '8px'}}>사용자 구분</p>
             {['전체', '개인', '기업'].map(f => (
               <label key={f} style={{display: 'block', fontSize: '13px', marginBottom: '4px', cursor: 'pointer'}}>
                 <input type="radio" checked={isCompanyFilter === f} onChange={() => setIsCompanyFilter(f)} /> {f}
               </label>
             ))}
          </div>
          <p className="panel-title">부서 &gt; 팀</p>
          <TreeItem node={{id: '', label: '전체'}} selected={selectedNode || ''} onSelect={setSelectedNode} />
          {treeData.map(node => <TreeItem key={node.id} node={node} selected={selectedNode} onSelect={setSelectedNode} />)}
        </aside>
        <div className="employee-main">
          <ToolBar
            left={<input className="search-input" placeholder="이름 검색..." value={search} onChange={e => setSearch(e.target.value)} />}
            buttons={[{ label: '새로고침', variant: 'secondary', onClick: fetchUsers }]}
          />
          {loading ? <div>로딩 중...</div> : <DataTable columns={columns as any} data={users.map((u, i) => ({ ...u, no: i + 1 })) as any} />}
        </div>
      </div>
    </div>
  )
}

