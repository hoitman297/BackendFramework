import './StatusBadge.css'

const colorMap: Record<string, string> = {
  // 공통
  활성: 'success',
  비활성: 'secondary',
  // 디바이스 상태
  입고: 'info',
  임대중: 'success',
  임대대기: 'warning',
  'AS접수': 'warning',
  'AS완료': 'info',
  폐기: 'danger',
  // 임대 상태
  신청: 'info',
  수령대기: 'warning',
  사용중: 'success',
  반납: 'secondary',
  // AS 상태
  이상무: 'secondary',
  접수: 'info',
  진행중: 'warning',
  완료: 'success',
  취소: 'secondary',
  // 기타
  이상접수: 'danger',
  교체사용: 'warning',
  미출고: 'info',
  출고: 'success',
  반품: 'warning',
  'AS진행': 'info',
  근무: 'success',
  휴직: 'warning',
  병가: 'info',
  퇴사: 'secondary',
}

interface Props {
  status: string
}

export default function StatusBadge({ status }: Props) {
  const color = colorMap[status] ?? 'secondary'
  return <span className={`badge badge-${color}`}>{status}</span>
}
