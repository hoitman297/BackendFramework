import { useState, useEffect } from 'react'
import PageHeader from '../../components/common/PageHeader'
import ToolBar from '../../components/common/ToolBar'
import DataTable from '../../components/common/DataTable'
import SummaryCard from '../../components/common/SummaryCard'
import Modal from '../../components/common/Modal'
import { api } from '../../services/api'
import './DeviceModel.css'

interface DeviceModel {
  model_id: number
  model_name: string
  version: string | null
  manual_url: string | null
  device_specs: string | null
  is_deleted: string
  created_at: string
}

const EMPTY_FORM = {
  model_name: '',
  version: '',
  manual_url: '',
  device_specs: '',
}

export default function DeviceModel() {
  const [models, setModels] = useState<DeviceModel[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(new Set<number>())

  // 신규/수정 모달
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null)
  const [editTarget, setEditTarget] = useState<DeviceModel | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)

  const fetchModels = async () => {
    setLoading(true)
    try {
      const res = await api.get<DeviceModel[]>('/models')
      setModels(res.data)
    } catch (err) {
      console.error(err)
      alert('모델 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchModels() }, [])

  const filtered = models.filter((m) => {
    if (!search) return true
    return [m.model_name, m.version, String(m.model_id)].some(
      (v) => v?.toLowerCase().includes(search.toLowerCase())
    )
  })

  const openCreate = () => {
    setForm({ ...EMPTY_FORM })
    setEditTarget(null)
    setFormMode('create')
  }

  const openEdit = (row: DeviceModel) => {
    setForm({
      model_name: row.model_name,
      version: row.version || '',
      manual_url: row.manual_url || '',
      device_specs: row.device_specs || '',
    })
    setEditTarget(row)
    setFormMode('edit')
  }

  const handleSave = async () => {
    if (!form.model_name.trim()) {
      alert('모델명은 필수입니다.')
      return
    }
    if (form.manual_url.trim()) {
      try { new URL(form.manual_url.trim()) } catch {
        alert('메뉴얼 URL 형식이 올바르지 않습니다.\n예) https://example.com/manual.pdf')
        return
      }
    }
    setSaving(true)
    try {
      const body = {
        model_name: form.model_name.trim(),
        version: form.version.trim() || null,
        manual_url: form.manual_url.trim() || null,
        device_specs: form.device_specs.trim() || null,
      }
      if (formMode === 'create') {
        await api.post('/models', body)
      } else if (editTarget) {
        await api.patch(`/models/${editTarget.model_id}`, body)
      }
      setFormMode(null)
      setSelected(new Set())
      await fetchModels()
    } catch (err: any) {
      alert(err.message || '저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const ids = Array.from(selected)
      .map((idx) => filtered[idx]?.model_id)
      .filter(Boolean)
    if (ids.length === 0) { alert('삭제할 모델을 선택하세요.'); return }
    if (!confirm(`${ids.length}개 모델을 삭제하시겠습니까?\n삭제된 모델은 복구할 수 없습니다.`)) return
    try {
      await Promise.all(ids.map((id) => api.delete(`/models/${id}`)))
      setSelected(new Set())
      await fetchModels()
    } catch (err: any) {
      alert(err.message || '삭제에 실패했습니다.')
    }
  }

  const columns = [
    { key: 'no', label: '순번', width: '60px' },
    { key: 'model_id', label: '모델ID', width: '80px' },
    {
      key: 'model_name',
      label: '모델명',
      render: (v: unknown) => <span className="model-name-cell">{String(v)}</span>,
    },
    {
      key: 'version',
      label: '버전',
      render: (v: unknown) => v ? <span className="version-badge">{String(v)}</span> : <span className="text-muted">-</span>,
    },
    {
      key: 'manual_url',
      label: '메뉴얼',
      render: (v: unknown) =>
        v ? (
          <a
            className="manual-link"
            href={String(v)}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            다운로드
          </a>
        ) : (
          <span className="text-muted">-</span>
        ),
    },
    {
      key: 'device_specs',
      label: '상세 스펙',
      render: (v: unknown) =>
        v ? (
          <span className="specs-preview" title={String(v)}>
            {String(v).length > 30 ? String(v).slice(0, 30) + '…' : String(v)}
          </span>
        ) : (
          <span className="text-muted">-</span>
        ),
    },
    {
      key: 'created_at',
      label: '등록일',
      render: (v: unknown) => v ? String(v).slice(0, 10) : '-',
    },
  ]

  const dataWithNo = filtered.map((m, i) => ({ ...m, no: i + 1 }))

  return (
    <div>
      <PageHeader
        breadcrumb={['디바이스 관리', '디바이스 모델 관리']}
        title="디바이스 모델 관리"
        description="디바이스 모델 정보를 등록하고 관리합니다."
      />

      <SummaryCard
        items={[
          { label: '전체 모델', value: models.length },
          { label: '메뉴얼 등록', value: models.filter((m) => m.manual_url).length, color: 'var(--success)' },
          { label: '메뉴얼 미등록', value: models.filter((m) => !m.manual_url).length, color: 'var(--warning)' },
          { label: '버전 등록', value: models.filter((m) => m.version).length },
        ]}
      />

      <ToolBar
        left={
          <input
            className="search-input"
            placeholder="모델명, 버전, ID 검색..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelected(new Set()) }}
          />
        }
        buttons={[
          { label: '신규 등록', variant: 'primary', onClick: openCreate },
          { label: '삭제', variant: 'danger', onClick: handleDelete, disabled: selected.size === 0 },
        ]}
      />

      <p className="table-info">
        총 {filtered.length}건{selected.size > 0 && ` / ${selected.size}건 선택됨`}
      </p>

      {loading ? (
        <div className="loading-state">모델 정보를 불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          {search ? `'${search}'에 해당하는 모델이 없습니다.` : '등록된 모델이 없습니다.'}
        </div>
      ) : (
        <DataTable
          columns={columns as any}
          data={dataWithNo as any}
          selectedRows={selected}
          onRowClick={(row) => openEdit(row as unknown as DeviceModel)}
          onSelectRow={(idx) => {
            const next = new Set(selected)
            if (next.has(idx)) next.delete(idx)
            else next.add(idx)
            setSelected(next)
          }}
          onSelectAll={(checked) =>
            setSelected(checked ? new Set(dataWithNo.map((_, i) => i)) : new Set())
          }
        />
      )}

      {/* 신규 등록 / 수정 모달 */}
      {formMode && (
        <Modal
          title={formMode === 'create' ? '디바이스 모델 신규 등록' : `모델 수정 — ${editTarget?.model_name}`}
          onClose={() => setFormMode(null)}
          width="480px"
        >
          <div className="model-form">
            {formMode === 'edit' && (
              <div className="form-row">
                <label className="form-label">모델 ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={editTarget?.model_id}
                  disabled
                />
              </div>
            )}

            <div className="form-row">
              <label className="form-label">
                모델명 <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="예) ERICA-BAND-1000"
                value={form.model_name}
                onChange={(e) => setForm({ ...form, model_name: e.target.value })}
                autoFocus
              />
            </div>

            <div className="form-row">
              <label className="form-label">버전</label>
              <input
                type="text"
                className="form-control"
                placeholder="예) 1.0.0"
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
              />
            </div>

            <div className="form-row">
              <label className="form-label">메뉴얼 URL</label>
              <input
                type="text"
                className="form-control"
                placeholder="예) https://example.com/manual.pdf"
                value={form.manual_url}
                onChange={(e) => setForm({ ...form, manual_url: e.target.value })}
              />
              {form.manual_url && (
                <p className="form-hint">
                  <a href={form.manual_url} target="_blank" rel="noreferrer">
                    링크 미리보기 →
                  </a>
                </p>
              )}
            </div>

            <div className="form-row">
              <label className="form-label">상세 스펙</label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="예) 센서 종류, 방수 등급, 배터리 용량, 통신 방식 등 상세 스펙 입력..."
                value={form.device_specs}
                onChange={(e) => setForm({ ...form, device_specs: e.target.value })}
              />
            </div>

            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setFormMode(null)}>
                취소
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '저장 중...' : formMode === 'create' ? '등록' : '저장'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
