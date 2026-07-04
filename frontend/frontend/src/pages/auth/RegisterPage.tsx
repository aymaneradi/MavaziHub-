import { FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'

export function RegisterPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    phonenumber: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (auth.isAuthenticated) {
    return <Navigate to="/profile" replace />
  }

  function updateField(field: keyof typeof form, value: string) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await auth.register(form)
      navigate('/login', {
        replace: true,
        state: { message: 'Registrierung erfolgreich. Du kannst dich jetzt anmelden.' },
      })
    } catch {
      setError('Registrierung fehlgeschlagen. Bitte prüfe deine Angaben.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <p className="eyebrow">Kundenkonto</p>
        <h1>Registrieren</h1>
        <p>Erstelle dein MavaziHub-Konto für Checkout, Bestellhistorie und Rücksendungen.</p>

        {error && <p className="auth-error">{error}</p>}

        <form className="auth-form auth-form-grid" onSubmit={handleSubmit}>
          <label>
            <span>Vorname</span>
            <input
              autoComplete="given-name"
              required
              value={form.firstname}
              onChange={(event) => updateField('firstname', event.target.value)}
            />
          </label>

          <label>
            <span>Nachname</span>
            <input
              autoComplete="family-name"
              required
              value={form.lastname}
              onChange={(event) => updateField('lastname', event.target.value)}
            />
          </label>

          <label>
            <span>Telefon</span>
            <input
              autoComplete="tel"
              required
              value={form.phonenumber}
              onChange={(event) => updateField('phonenumber', event.target.value)}
            />
          </label>

          <label>
            <span>E-Mail</span>
            <input
              autoComplete="email"
              required
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
          </label>

          <label className="auth-form-wide">
            <span>Passwort</span>
            <input
              autoComplete="new-password"
              minLength={6}
              required
              type="password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
            />
          </label>

          <button className="auth-form-wide" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Konto wird erstellt' : 'Konto erstellen'}
          </button>
        </form>

        <p className="auth-switch">
          Schon registriert? <Link to="/login">Anmelden</Link>
        </p>
      </div>
    </section>
  )
}
