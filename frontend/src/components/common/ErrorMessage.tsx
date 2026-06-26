type ErrorMessageProps = {
  title?: string
  message: string
}

function ErrorMessage({ title = 'Fehler', message }: ErrorMessageProps) {
  return (
    <div className="mh-alert mh-alert-error" role="alert">
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  )
}

export default ErrorMessage