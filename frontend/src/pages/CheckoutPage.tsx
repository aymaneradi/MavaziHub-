import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { checkout } from '../api/orderApi'
import { useAuth } from '../auth/AuthContext'

function CheckoutPage() {
  const navigate = useNavigate()
  const { currentUser, isAuthenticated, isInitializing } = useAuth()
  const [street, setStreet] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [city, setCity] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!currentUser) {
      setError('Bitte melde dich zuerst an.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const order = await checkout({
        street,
        zipCode,
        city,
      })

      navigate(`/orders/${order.id}`)
    } catch {
      setError('Bestellung konnte nicht erstellt werden. Pruefe bitte, ob dein Warenkorb Artikel enthaelt.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-section">
      <Link className="secondary-link" to="/cart">
        Zurueck zum Warenkorb
      </Link>

      <div className="page-heading">
        <p>Checkout</p>
        <h1>Bestellung abschliessen</h1>
        <span>Gib deine Lieferadresse ein. Die Zahlung wird im Backend aktuell simuliert.</span>
      </div>

      {isInitializing && <p className="status-message">Sitzung wird geprueft...</p>}

      {!isInitializing && !isAuthenticated && (
        <div className="empty-panel">
          <h2>Bitte anmelden</h2>
          <p>Eine Bestellung kann nur mit einem Kundenkonto erstellt werden.</p>
          <Link className="primary-link-button" to="/login">
            Zum Login
          </Link>
        </div>
      )}

      {!isInitializing && isAuthenticated && (
        <form className="checkout-form" onSubmit={handleSubmit}>
          <label>
            Strasse und Hausnummer
            <input
              required
              value={street}
              placeholder="Musterstrasse 12"
              onChange={(event) => setStreet(event.target.value)}
            />
          </label>

          <div className="checkout-form-grid">
            <label>
              PLZ
              <input
                required
                value={zipCode}
                placeholder="12345"
                onChange={(event) => setZipCode(event.target.value)}
              />
            </label>

            <label>
              Stadt
              <input
                required
                value={city}
                placeholder="Berlin"
                onChange={(event) => setCity(event.target.value)}
              />
            </label>
          </div>

          {error && <p className="status-message status-message-error">{error}</p>}

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Bestellung wird erstellt...' : 'Bestellung abschliessen'}
          </button>
        </form>
      )}
    </section>
  )
}

export default CheckoutPage
