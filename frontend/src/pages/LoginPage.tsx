import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, login, register } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [phonenumber, setPhonenumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (mode === 'login') {
        await login({ email, password })
      } else {
        await register({ firstname, lastname, phonenumber, email, password })
      }

      navigate('/orders')
    } catch {
      setError('Anmeldung oder Registrierung ist fehlgeschlagen.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <p>Kundenkonto</p>
        <h1>Anmelden</h1>
        <span>
          Melde dich an oder erstelle ein neues Konto. Danach werden geschuetzte API-Aufrufe mit
          deinem Token gesendet.
        </span>
      </div>

      <div className="auth-panel">
        <div className="auth-tabs" aria-label="Auth Modus">
          <button
            className={mode === 'login' ? 'active' : ''}
            type="button"
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={mode === 'register' ? 'active' : ''}
            type="button"
            onClick={() => setMode('register')}
          >
            Registrieren
          </button>
        </div>

        {isAuthenticated && (
          <p className="status-message">Du bist bereits angemeldet. Du kannst deine Bestellungen oeffnen.</p>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="auth-form-grid">
              <label>
                Vorname
                <input
                  required
                  value={firstname}
                  onChange={(event) => setFirstname(event.target.value)}
                />
              </label>
              <label>
                Nachname
                <input
                  required
                  value={lastname}
                  onChange={(event) => setLastname(event.target.value)}
                />
              </label>
              <label>
                Telefonnummer
                <input
                  required
                  value={phonenumber}
                  onChange={(event) => setPhonenumber(event.target.value)}
                />
              </label>
            </div>
          )}

          <label>
            E-Mail
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label>
            Passwort
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error && <p className="status-message status-message-error">{error}</p>}

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Bitte warten...' : mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default LoginPage
