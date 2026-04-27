import './StatusBadge.css'

const colorMap: Record<string, string> = {
  활성: 'success',
  비활성: 'secondary',
  신청: 'info',
  수령대기: 'warning',
  사용중: 'success',
  이상접수: 'danger',
  교체사용: 'warning',
  반납: 'secondary',
  미출고: 'info',
  출고: 'success',
  폐기: 'danger',
  반품: 'warning',
  'AS접수': 'warning',
  'AS진행': 'info',
  완료: 'success',
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
