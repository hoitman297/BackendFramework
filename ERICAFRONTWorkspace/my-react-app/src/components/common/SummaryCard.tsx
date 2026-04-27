import './SummaryCard.css'

interface Item {
  label: string
  value: string | number
  color?: string
}

interface Props {
  items: Item[]
}

export default function SummaryCard({ items }: Props) {
  return (
    <div className="summary-cards">
      {items.map((item) => (
        <div className="summary-card" key={item.label}>
          <p className="summary-label">{item.label}</p>
          <p className="summary-value" style={item.color ? { color: item.color } : {}}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}
