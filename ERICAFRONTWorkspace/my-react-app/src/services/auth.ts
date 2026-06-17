export function getRole(): string {
  return localStorage.getItem('role') ?? 'ADMIN'
}

export function isStaff(): boolean {
  return getRole() === 'STAFF'
}

export function getStaffBranchId(): number | null {
  const v = localStorage.getItem('branchId')
  if (v == null) return null
  const n = Number(v)
  return isNaN(n) ? null : n
}
