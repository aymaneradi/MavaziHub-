import axios from 'axios'
import { type FormEvent, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'

type ApiErrorResponse = {
  message?: string
}

type LocationState = {
  from?: {
    pathname?: string
  }
  message?: string
}

function getLoginErrorMessage(error: unknown) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return 'Die Anmeldung ist gerade nicht möglich.'
  }

  if (!error.response) {
    return 'Die Anmeldung ist gerade nicht möglich.'
  }

  const status = error.response.status
  const backendMessage = error.response.data?.message?.toLowerCase() ?? ''

  if (
    backendMessage.includes('deaktiviert') ||
    backendMessage.includes('disabled') ||
    backendMessage.includes('locked')
  ) {
    return 'Dieses Konto wurde deaktiviert.'
  }

  if (status === 400 || status === 401) {
    return 'E-Mail oder Passwort ist nicht korrekt.'
  }

  return 'Die Anmeldung ist gerade nicht möglich.'
}

export function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = state?.from?.pathname ?? '/profile'

  if (auth.isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await auth.login({ email, password })
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setError(getLoginErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <p className="eyebrow">Willkommen zurück</p>
        <h1>Anmelden</h1>
        <p>Melde dich an und fahre mit deinem Einkauf fort.</p>

        {state?.message && <p className="auth-success">{state.message}</p>}
        {error && <p className="auth-error">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>E-Mail</span>
            <input
              autoComplete="email"
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label>
            <span>Passwort</span>
            <input
              autoComplete="current-password"
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Anmeldung läuft' : 'Anmelden'}
          </button>
        </form>

        <p className="auth-switch">
          Noch kein Konto? <Link to="/register">Registrieren</Link>
        </p>
      </div>

    </section>
  )
}
