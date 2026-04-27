import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader'
import Modal from '../../components/common/Modal'
import DataTable from '../../components/common/DataTable'
import './DepartmentTeam.css'

interface Dept {
  order: number
  name: string
  createdDate: string
  active: boolean
}

interface Team {
  order: number
  name: string
  dept: string
  createdDate: string
  active: boolean
}

const mockDepts: Dept[] = [
  { order: 1, name: '경영', createdDate: '2025-01-01', active: true },
  { order: 2, name: '기술', createdDate: '2025-01-01', active: true },
  { order: 3, name: '영업', createdDate: '2025-02-01', active: true },
  { order: 4, name: '지원', createdDate: '2025-02-01', active: false },
]

const mockTeams: Record<string, Team[]> = {
  경영: [
    { order: 1, name: '경영관리', dept: '경영', createdDate: '2025-01-01', active: true },
    { order: 2, name: '경영지원', dept: '경영', createdDate: '2025-01-01', active: true },
  ],
  기술: [
    { order: 1, name: '개발팀', dept: '기술', createdDate: '2025-01-01', active: true },
    { order: 2, name: 'QA팀', dept: '기술', createdDate: '2025-02-01', active: true },
  ],
  영업: [
    { order: 1, name: '국내영업', dept: '영업', createdDate: '2025-02-01', active: true },
  ],
  지원: [],
}

const historyData = [
  { no: 1, date: '2025-03-01', field: '부서명', before: '경영지원본부', after: '경영관리', modifier: '관리자' },
]

const historyColumns = [
  { key: 'no', label: '순번', width: '55px' },
  { key: 'date', label: '변경일' },
  { key: 'field', label: '변경항목' },
  { key: 'before', label: '변경전' },
  { key: 'after', label: '변경후' },
  { key: 'modifier', label: '수정자' },
]

export default function DepartmentTeam() {
  const [selectedDept, setSelectedDept] = useState('경영')
  const [historyTarget, setHistoryTarget] = useState<string | null>(null)

  const teams = mockTeams[selectedDept] ?? []

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
              <button className="btn btn-primary btn-sm">신규</button>
              <button className="btn btn-secondary btn-sm">저장</button>
            </div>
          </div>
          <table className="inner-table">
            <thead>
              <tr>
                <th>순서</th>
                <th>이력</th>
                <th>부서명</th>
                <th>생성적용일</th>
                <th>사용</th>
              </tr>
            </thead>
            <tbody>
              {mockDepts.map((d) => (
                <tr
                  key={d.name}
                  className={selectedDept === d.name ? 'selected' : ''}
                  onClick={() => setSelectedDept(d.name)}
                >
                  <td>{d.order}</td>
                  <td>
                    <button className="link-btn" onClick={(e) => { e.stopPropagation(); setHistoryTarget(d.name) }}>
                      이력
                    </button>
                  </td>
                  <td>{d.name}</td>
                  <td>{d.createdDate}</td>
                  <td>
                    <span className={`toggle ${d.active ? 'on' : 'off'}`}>
                      {d.active ? 'ON' : 'OFF'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="more-btn">더보기</button>
        </div>

        {/* 팀 패널 */}
        <div className="dept-panel">
          <div className="panel-header">
            <span className="panel-title-text">{selectedDept} &gt; 팀</span>
            <div className="panel-actions">
              <button className="btn btn-primary btn-sm">신규</button>
              <button className="btn btn-secondary btn-sm">저장</button>
            </div>
          </div>
          <table className="inner-table">
            <thead>
              <tr>
                <th>순서</th>
                <th>이력</th>
                <th>팀</th>
                <th>부서</th>
                <th>생성적용일</th>
                <th>사용</th>
              </tr>
            </thead>
            <tbody>
              {teams.length === 0 ? (
                <tr><td colSpan={6} className="empty-cell">데이터가 없습니다.</td></tr>
              ) : (
                teams.map((t) => (
                  <tr key={t.name}>
                    <td>{t.order}</td>
                    <td>
                      <button className="link-btn" onClick={() => setHistoryTarget(t.name)}>이력</button>
                    </td>
                    <td>{t.name}</td>
                    <td>{t.dept}</td>
                    <td>{t.createdDate}</td>
                    <td>
                      <span className={`toggle ${t.active ? 'on' : 'off'}`}>
                        {t.active ? 'ON' : 'OFF'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <button className="more-btn">더보기</button>
        </div>
      </div>

      {historyTarget && (
        <Modal title={`${historyTarget} 변경 이력`} onClose={() => setHistoryTarget(null)} width="650px">
          <DataTable
            columns={historyColumns as Parameters<typeof DataTable>[0]['columns']}
            data={historyData as Record<string, unknown>[]}
          />
        </Modal>
      )}
    </div>
  )
}
