import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader'
import './CenterInfo.css'

interface FieldProps {
  label: string
  field: string
  span?: boolean
  form: Record<string, string>
  onChange: (key: string, value: string) => void
}

function FormField({ label, field, span, form, onChange }: FieldProps) {
  return (
    <div className={`form-field${span ? ' span-2' : ''}`}>
      <label className="form-label">{label}</label>
      <input
        className="form-input"
        value={form[field] ?? ''}
        onChange={(e) => onChange(field, e.target.value)}
      />
    </div>
  )
}

export default function CenterInfo() {
  const [form, setForm] = useState<Record<string, string>>({
    bizNo: '123-45-67890',
    corpNo: '110111-1234567',
    bizType: '서비스',
    bizItem: '의료기기 임대',
    centerName: 'ERICA 센터',
    centerNameShort: 'ERICA',
    centerNameEn: 'ERICA Center',
    centerNameEnShort: 'ERICA',
    headName: '홍길동',
    tel: '02-1234-5678',
    fax: '02-1234-5679',
    email: 'center@erica.com',
    postCode: '06000',
    address: '서울 강남구 테헤란로 123',
    taxEmail: 'tax@erica.com',
    taxManager: '김세무',
    taxTel: '02-1234-5680',
    taxFax: '02-1234-5681',
  })

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const fp = { form, onChange: handleChange }

  return (
    <div>
      <PageHeader
        breadcrumb={['지점/센터', '센터정보']}
        title="센터정보"
        description="센터 기본 정보를 관리합니다."
      />

      <div className="center-info-card">
        <section className="form-section">
          <h3 className="section-title">기본 정보</h3>
          <div className="form-grid">
            <FormField {...fp} label="사업자등록번호" field="bizNo" />
            <FormField {...fp} label="법인등록번호" field="corpNo" />
            <FormField {...fp} label="업태" field="bizType" />
            <FormField {...fp} label="업종" field="bizItem" />
            <FormField {...fp} label="센터명" field="centerName" />
            <FormField {...fp} label="센터명 약칭" field="centerNameShort" />
            <FormField {...fp} label="영문 센터명" field="centerNameEn" />
            <FormField {...fp} label="영문 센터명 약칭" field="centerNameEnShort" />
            <FormField {...fp} label="센터장" field="headName" />
            <FormField {...fp} label="대표 전화번호" field="tel" />
            <FormField {...fp} label="대표 팩스번호" field="fax" />
            <FormField {...fp} label="대표 이메일" field="email" />
            <FormField {...fp} label="우편번호" field="postCode" />
            <FormField {...fp} label="주소" field="address" span />
          </div>
        </section>

        <section className="form-section">
          <h3 className="section-title">세금계산서 담당자</h3>
          <div className="form-grid">
            <FormField {...fp} label="이메일" field="taxEmail" />
            <FormField {...fp} label="담당자명" field="taxManager" />
            <FormField {...fp} label="전화번호" field="taxTel" />
            <FormField {...fp} label="팩스번호" field="taxFax" />
          </div>
        </section>

        <section className="form-section">
          <h3 className="section-title">센터 직인 및 로고</h3>
          <div className="upload-grid">
            <div className="upload-item">
              <label className="form-label">센터 직인</label>
              <div className="upload-box">
                <p>이미지 파일을 업로드 해주세요</p>
                <button className="btn btn-secondary" onClick={() => alert('파일 선택')}>파일 선택</button>
              </div>
            </div>
            <div className="upload-item">
              <label className="form-label">센터 로고 (밝은 모드)</label>
              <div className="upload-box">
                <p>이미지 파일을 업로드 해주세요</p>
                <button className="btn btn-secondary" onClick={() => alert('파일 선택')}>파일 선택</button>
              </div>
            </div>
            <div className="upload-item">
              <label className="form-label">센터 로고 (어두운 모드)</label>
              <div className="upload-box">
                <p>이미지 파일을 업로드 해주세요</p>
                <button className="btn btn-secondary" onClick={() => alert('파일 선택')}>파일 선택</button>
              </div>
            </div>
          </div>
        </section>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={() => alert('저장되었습니다.')}>저장</button>
        </div>
      </div>
    </div>
  )
}
