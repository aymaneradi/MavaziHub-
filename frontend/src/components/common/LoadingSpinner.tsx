type LoadingSpinnerProps = {
  text?: string
}

function LoadingSpinner({ text = 'Daten werden geladen ...' }: LoadingSpinnerProps) {
  return (
    <div className="mh-loading" role="status">
      <div className="mh-loading-circle" />
      <span>{text}</span>
    </div>
  )
}

export default LoadingSpinner