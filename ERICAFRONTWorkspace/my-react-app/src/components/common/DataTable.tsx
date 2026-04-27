import { useRef, useEffect } from 'react'
import './DataTable.css'

interface Column {
  key: string
  label: string
  width?: string
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode
}

interface Props {
  columns: Column[]
  data: Record<string, unknown>[]
  onRowClick?: (row: Record<string, unknown>) => void
  selectedRows?: Set<number>
  onSelectRow?: (idx: number) => void
  onSelectAll?: (checked: boolean) => void
}

export default function DataTable({
  columns,
  data,
  onRowClick,
  selectedRows,
  onSelectRow,
  onSelectAll,
}: Props) {
  const hasCheckbox = !!onSelectRow
  const allChecked = (selectedRows?.size ?? 0) === data.length && data.length > 0
  const someChecked = (selectedRows?.size ?? 0) > 0 && !allChecked
  const headerCheckRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (headerCheckRef.current) {
      headerCheckRef.current.indeterminate = someChecked
    }
  }, [someChecked])

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {hasCheckbox && (
              <th className="col-check">
                <input
                  ref={headerCheckRef}
                  type="checkbox"
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                  checked={allChecked}
                />
              </th>
            )}
            {columns.map((col) => (
              <th key={col.key} style={col.width ? { width: col.width } : {}}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (hasCheckbox ? 1 : 0)} className="empty-cell">
                데이터가 없습니다.
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={idx}
                className={selectedRows?.has(idx) ? 'selected' : ''}
                onClick={() => onRowClick?.(row)}
              >
                {hasCheckbox && (
                  <td className="col-check" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedRows?.has(idx) ?? false}
                      onChange={() => onSelectRow?.(idx)}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render
                      ? col.render(row[col.key], row)
                      : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
