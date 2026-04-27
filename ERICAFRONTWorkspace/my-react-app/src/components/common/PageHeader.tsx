import './PageHeader.css'

interface Props {
  breadcrumb?: string[]
  title: string
  description?: string
}

export default function PageHeader({ breadcrumb, title, description }: Props) {
  return (
    <div className="page-header">
      {breadcrumb && (
        <p className="breadcrumb">{breadcrumb.join(' > ')}</p>
      )}
      <h2 className="page-title">{title}</h2>
      {description && <p className="page-desc">{description}</p>}
    </div>
  )
}
