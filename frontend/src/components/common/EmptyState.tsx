type EmptyStateProps = {
  title: string
  message?: string
}

function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="mh-empty-state">
      <h2>{title}</h2>
      {message && <p className="mh-text-muted">{message}</p>}
    </div>
  )
}

export default EmptyState