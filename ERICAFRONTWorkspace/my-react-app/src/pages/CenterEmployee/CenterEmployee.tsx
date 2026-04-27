import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader'
import ToolBar from '../../components/common/ToolBar'
import DataTable from '../../components/common/DataTable'
import StatusBadge from '../../components/common/StatusBadge'
import './CenterEmployee.css'

interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
}

const treeData: TreeNode[] = [
  {
    id: '경영', label: '경영', children: [
      { id: '경영관리', label: '경영관리팀' },
      { id: '경영지원', label: '경영지원팀' },
    ]
  },
  {
    id: '기술', label: '기술', children: [
      { id: '개발', label: '개발팀' },
      { id: 'QA', label: 'QA팀' },
    ]
  },
  {
    id: '영업', label: '영업', children: [
      { id: '국내영업', label: '국내영업팀' },
    ]
  },
]

const mockEmployees = [
  { no: 1, history: '이력', type: '정규직', name: '홍길동', empNo: 'E001', dept: '경영', team: '경영지원팀', rank: '팀장', workStatus: '근무', statusDate: '2025-01-01', joinDate: '2020-03-01', remark: '' },
  { no: 2, history: '이력', type: '정규직', name: '김철수', empNo: 'E002', dept: '경영', team: '경영지원팀', rank: '대리', workStatus: '근무', statusDate: '2022-05-01', joinDate: '2022-05-01', remark: '' },
  { no: 3, history: '이력', type: '계약직', name: '이영희', empNo: 'E003', dept: '경영', team: '경영지원팀', rank: '사원', workStatus: '휴직', statusDate: '2024-12-01', joinDate: '2023-01-01', remark: '육아휴직' },
  { no: 4, history: '이력', type: '정규직', name: '박민준', empNo: 'E004', dept: '경영', team: '경영지원팀', rank: '과장', workStatus: '근무', statusDate: '2021-07-01', joinDate: '2019-07-01', remark: '' },
  { no: 5, history: '이력', type: '일용직', name: '최서연', empNo: 'E005', dept: '경영', team: '경영지원팀', rank: '사원', workStatus: '퇴사', statusDate: '2024-06-30', joinDate: '2023-06-01', remark: '' },
]

const empColumns = [
  { key: 'no', label: 'No', width: '50px' },
  { key: 'history', label: '이력', render: () => <button className="link-btn">이력</button> },
  { key: 'type', label: '근무형태' },
  { key: 'name', label: '이름' },
  { key: 'empNo', label: '사원번호' },
  { key: 'dept', label: '부서' },
  { key: 'team', label: '팀' },
  { key: 'rank', label: '직급' },
  { key: 'workStatus', label: '근무상태', render: (v: unknown) => <StatusBadge status={String(v)} /> },
  { key: 'statusDate', label: '근무상태적용일' },
  { key: 'joinDate', label: '입사일' },
  { key: 'remark', label: '비고' },
]

const TYPE_OPTIONS = ['전체', '정규직', '계약직', '일용직']
const WORK_STATUS_OPTIONS = ['전체', '근무', '휴직', '병가', '퇴사']

function TreeNode({ node, selected, onSelect, depth = 0 }: {
  node: TreeNode
  selected: string
  onSelect: (id: string) => void
  depth?: number
}) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <div
        className={`tree-node${selected === node.id ? ' active' : ''}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => { onSelect(node.id); if (node.children) setOpen(!open) }}
      >
        {node.children && (
          <span className="tree-toggle">{open ? '▾' : '▸'}</span>
        )}
        <span className="tree-label">{node.label}</span>
      </div>
      {open && node.children?.map((child) => (
        <TreeNode key={child.id} node={child} selected={selected} onSelect={onSelect} depth={depth + 1} />
      ))}
    </div>
  )
}

export default function CenterEmployee() {
  const [selectedNode, setSelectedNode] = useState('경영지원')
  const [typeFilter, setTypeFilter] = useState('전체')
  const [workFilter, setWorkFilter] = useState('전체')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(new Set<number>())

  const filtered = mockEmployees.filter((row) => {
    const matchType = typeFilter === '전체' || row.type === typeFilter
    const matchWork = workFilter === '전체' || row.workStatus === workFilter
    const matchSearch = !search || [row.name, row.empNo, row.dept, row.team].some((v) => v.includes(search))
    return matchType && matchWork && matchSearch
  })

  const nodeLabel = (() => {
    for (const d of treeData) {
      if (d.id === selectedNode) return `${d.label}`
      for (const t of d.children ?? []) {
        if (t.id === selectedNode) return `${d.label} > ${t.label}`
      }
    }
    return selectedNode
  })()

  return (
    <div>
      <PageHeader
        breadcrumb={['조직 관리', '센터 담당직원']}
        title="센터 담당직원"
        description="센터 직원 정보를 관리합니다."
      />

      <div className="employee-layout">
        {/* 트리 패널 */}
        <aside className="tree-panel">
          <p className="panel-title">부서 &gt; 팀</p>
          <div className="tree-wrap">
            {treeData.map((node) => (
              <TreeNode key={node.id} node={node} selected={selectedNode} onSelect={setSelectedNode} />
            ))}
          </div>
        </aside>

        {/* 직원 목록 */}
        <div className="employee-main">
          <div className="employee-panel-header">
            <p className="employee-title">{nodeLabel} 직원</p>
            <div className="employee-type-filter">
              {TYPE_OPTIONS.map((t) => (
                <button
                  key={t}
                  className={`type-btn${typeFilter === t ? ' active' : ''}`}
                  onClick={() => setTypeFilter(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <ToolBar
            left={
              <>
                <select className="filter-select" value={workFilter} onChange={(e) => setWorkFilter(e.target.value)}>
                  {WORK_STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
                <input
                  className="search-input"
                  placeholder="이름, 사원번호, 부서, 팀 검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </>
            }
            buttons={[
              { label: '신규', variant: 'primary', onClick: () => alert('신규') },
              { label: '저장', variant: 'secondary', onClick: () => alert('저장') },
            ]}
          />

          <DataTable
            columns={empColumns as Parameters<typeof DataTable>[0]['columns']}
            data={filtered as Record<string, unknown>[]}
            selectedRows={selected}
            onSelectRow={(idx) => {
              const next = new Set(selected)
              if (next.has(idx)) { next.delete(idx) } else { next.add(idx) }
              setSelected(next)
            }}
            onSelectAll={(checked) =>
              setSelected(checked ? new Set(filtered.map((_, i) => i)) : new Set())
            }
          />
          <p className="table-info">전체 ({filtered.length})</p>
        </div>
      </div>
    </div>
  )
}
