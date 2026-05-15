import { useState, useEffect } from 'react'
import PageHeader from '../../components/common/PageHeader'
import { api } from '../../services/api'
import './CenterInfo.css'

export default function CenterInfo() {
  const [form, setForm] = useState<any>({
    center_name: '',
    center_short_name: '',
    eng_name: '',
    biz_reg_no: '',
    director_name: '',
    address: '',
    main_phone: '',
    main_fax: '',
    biz_type: '',
    biz_category: '',
    tax_mgr_name: '',
    logo_img_url: '',
    seal_img_url: '',
  })

  const fetchCenterInfo = async () => {
    try {
      const res = await api.get<any>('/centers/1') // 예시로 ID 1번 조회
      setForm(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { fetchCenterInfo() }, [])

  const handleChange = (key: string, value: string) =>
    setForm((prev: any) => ({ ...prev, [key]: value }))

  const save = async () => {
    try {
      await api.patch('/centers/1', form)
      alert('저장되었습니다.')
    } catch (err) {
      alert('저장 실패')
    }
  }

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
            <div className="form-field"><label>센터명</label><input value={form.center_name} onChange={e => handleChange('center_name', e.target.value)} /></div>
            <div className="form-field"><label>센터명 약칭</label><input value={form.center_short_name} onChange={e => handleChange('center_short_name', e.target.value)} /></div>
            <div className="form-field"><label>영문 센터명</label><input value={form.eng_name} onChange={e => handleChange('eng_name', e.target.value)} /></div>
            <div className="form-field"><label>사업자등록번호</label><input value={form.biz_reg_no} onChange={e => handleChange('biz_reg_no', e.target.value)} /></div>
            <div className="form-field"><label>센터장</label><input value={form.director_name} onChange={e => handleChange('director_name', e.target.value)} /></div>
            <div className="form-field span-2"><label>주소</label><input value={form.address} onChange={e => handleChange('address', e.target.value)} /></div>
            <div className="form-field"><label>대표 전화번호</label><input value={form.main_phone} onChange={e => handleChange('main_phone', e.target.value)} /></div>
            <div className="form-field"><label>대표 팩스번호</label><input value={form.main_fax} onChange={e => handleChange('main_fax', e.target.value)} /></div>
            <div className="form-field"><label>업태</label><input value={form.biz_type} onChange={e => handleChange('biz_type', e.target.value)} /></div>
            <div className="form-field"><label>업종</label><input value={form.biz_category} onChange={e => handleChange('biz_category', e.target.value)} /></div>
          </div>
        </section>

        <section className="form-section">
          <h3 className="section-title">세금계산서 담당자</h3>
          <div className="form-grid">
            <div className="form-field"><label>담당자명</label><input value={form.tax_mgr_name} onChange={e => handleChange('tax_mgr_name', e.target.value)} /></div>
          </div>
        </section>

        <section className="form-section">
          <h3 className="section-title">센터 직인 및 로고</h3>
          <div className="upload-grid">
            <div className="upload-item">
               <label>센터 직인</label>
               <div className="upload-box">
                 {form.seal_img_url ? <img src={form.seal_img_url} alt="직인" /> : <p>이미지 업로드</p>}
                 <input type="file" onChange={() => alert('파일 업로드 API (SYS-004) 연동 예정')} />
               </div>
            </div>
            <div className="upload-item">
               <label>센터 로고</label>
               <div className="upload-box">
                 {form.logo_img_url ? <img src={form.logo_img_url} alt="로고" /> : <p>이미지 업로드</p>}
                 <input type="file" />
               </div>
            </div>
          </div>
        </section>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={save}>저장</button>
        </div>
      </div>
    </div>
  )
}

