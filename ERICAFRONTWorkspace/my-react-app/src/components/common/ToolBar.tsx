import './ToolBar.css'

interface BtnProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}

interface Props {
  left?: React.ReactNode
  buttons?: BtnProps[]
}

export default function ToolBar({ left, buttons }: Props) {
  return (
    <div className="toolbar">
      <div className="toolbar-left">{left}</div>
      <div className="toolbar-right">
        {buttons?.map((btn) => (
          <button
            key={btn.label}
            className={`btn btn-${btn.variant ?? 'secondary'}`}
            onClick={btn.onClick}
            disabled={btn.disabled}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}
