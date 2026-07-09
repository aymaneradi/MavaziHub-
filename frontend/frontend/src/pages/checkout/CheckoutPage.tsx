import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { cartApi } from '../../api'
import type { FormEvent } from 'react'
import type { CartResponse, OrderResponse } from '../../types'

const formatCurrency = (value: number) =>
  value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })

const checkoutSteps = ['Warenkorb', 'Lieferadresse', 'Zahlungsart', 'Bestätigung']
const orderStatusLabel = (status: string) =>
  ({
    CREATED: 'Angelegt',
    PAID: 'Bezahlt',
    PROCESSING: 'In Bearbeitung',
    SHIPPED: 'Versendet',
    DELIVERED: 'Geliefert',
    CANCELLED: 'Storniert',
  })[status] ?? status

export function CheckoutPage() {
  const [step, setStep] = useState(0)
  const [cart, setCart] = useState<CartResponse | null>(null)
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [address, setAddress] = useState({
    street: '',
    zipCode: '',
    city: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('invoice')

  useEffect(() => {
    async function loadCart() {
      try {
        const response = await cartApi.getCart()
        setCart(response)
      } catch {
        setMessage('Der Warenkorb konnte gerade nicht geladen werden.')
        setCart({ items: [], totalPrice: 0 })
      } finally {
        setIsLoading(false)
      }
    }

    void loadCart()
  }, [])

  const items = cart?.items ?? []
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])
  const canContinueAddress =
    address.street.trim().length > 0 &&
    address.zipCode.trim().length > 0 &&
    address.city.trim().length > 0

  function nextStep() {
    setStep((currentStep) => Math.min(currentStep + 1, checkoutSteps.length - 1))
  }

  function previousStep() {
    setStep((currentStep) => Math.max(currentStep - 1, 0))
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setIsSubmitting(true)

    try {
      const response = await cartApi.checkout(address)
      setOrder(response)
      setCart({ items: [], totalPrice: 0 })
    } catch {
      setMessage('Die Bestellung konnte nicht abgeschlossen werden.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <section className="checkout-page">
        <div className="commerce-empty">
          <h1>Kasse wird geladen</h1>
        </div>
      </section>
    )
  }

  if (order) {
    return (
      <section className="checkout-page">
        <div className="confirmation-panel">
          <p className="eyebrow">Bestätigung</p>
          <h1>Bestellung eingegangen</h1>
          <p>
            Danke, deine Bestellung ist eingegangen. Zahlungsart:{' '}
            {paymentMethod === 'invoice' ? 'Rechnung' : 'Karte'}.
          </p>
          <dl>
            <div>
              <dt>Bestellnummer</dt>
              <dd>{order.id}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{orderStatusLabel(order.status)}</dd>
            </div>
            <div>
              <dt>Summe</dt>
              <dd>{formatCurrency(order.totalPrice)}</dd>
            </div>
          </dl>
          <Link to="/orders">Zu meinen Bestellungen</Link>
        </div>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section className="checkout-page">
        <div className="commerce-empty">
          <h1>Dein Warenkorb ist leer</h1>
          <p>Lege zuerst Produkte in den Warenkorb, bevor du zur Kasse gehst.</p>
          <Link to="/products">Produkte ansehen</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="checkout-page">
      <div className="commerce-header">
        <div>
          <p className="eyebrow">Kasse</p>
          <h1>Bestellung abschließen</h1>
          <p>Schau dir deine Auswahl an, ergänze die Lieferadresse und bestätige die Bestellung.</p>
        </div>
      </div>

      <ol className="checkout-steps" aria-label="Bestellschritte">
        {checkoutSteps.map((label, index) => (
          <li className={index === step ? 'active' : index < step ? 'done' : undefined} key={label}>
            <span>{index + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      {message && <p className="commerce-message" role="status">{message}</p>}

      <form className="checkout-layout" onSubmit={submitOrder}>
        <div className="checkout-panel">
          {step === 0 && (
            <div className="checkout-step-panel">
              <h2>Deine Artikel</h2>
              {items.map((item) => (
                <div className="checkout-line" key={item.id}>
                  <span>{item.productName}</span>
                  <small>
                    {item.quantity} × {formatCurrency(item.unitPrice)}
                  </small>
                  <strong>{formatCurrency(item.subtotal)}</strong>
                </div>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="checkout-step-panel">
              <h2>Lieferadresse</h2>
              <div className="checkout-form-grid">
                <label className="checkout-wide">
                  <span>Straße und Hausnummer</span>
                  <input
                    required
                    value={address.street}
                    onChange={(event) =>
                      setAddress((current) => ({ ...current, street: event.target.value }))
                    }
                  />
                </label>
                <label>
                  <span>PLZ</span>
                  <input
                    required
                    value={address.zipCode}
                    onChange={(event) =>
                      setAddress((current) => ({ ...current, zipCode: event.target.value }))
                    }
                  />
                </label>
                <label>
                  <span>Stadt</span>
                  <input
                    required
                    value={address.city}
                    onChange={(event) =>
                      setAddress((current) => ({ ...current, city: event.target.value }))
                    }
                  />
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="checkout-step-panel">
              <h2>Zahlungsart</h2>
              <div className="payment-options">
                <label>
                  <input
                    checked={paymentMethod === 'invoice'}
                    name="payment"
                    type="radio"
                    value="invoice"
                    onChange={(event) => setPaymentMethod(event.target.value)}
                  />
                  Rechnung
                </label>
                <label>
                  <input
                    checked={paymentMethod === 'card'}
                    name="payment"
                    type="radio"
                    value="card"
                    onChange={(event) => setPaymentMethod(event.target.value)}
                  />
                  Karte
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="checkout-step-panel">
              <h2>Bestätigung</h2>
              <p>
                Prüfe deine Angaben. Wenn alles passt, kannst du deine Bestellung bestätigen.
              </p>
              <dl className="checkout-review">
                <div>
                  <dt>Lieferadresse</dt>
                  <dd>
                    {address.street}, {address.zipCode} {address.city}
                  </dd>
                </div>
                <div>
                  <dt>Zahlungsart</dt>
                  <dd>{paymentMethod === 'invoice' ? 'Rechnung' : 'Karte'}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        <aside className="cart-summary checkout-summary">
          <h2>Übersicht</h2>
          <dl>
            <div>
              <dt>Artikel</dt>
              <dd>{itemCount}</dd>
            </div>
            <div>
              <dt>Summe</dt>
              <dd>{formatCurrency(cart?.totalPrice ?? 0)}</dd>
            </div>
          </dl>

          <div className="checkout-actions">
            {step > 0 && (
              <button className="secondary-action" type="button" onClick={previousStep}>
                Zurück
              </button>
            )}
            {step < 3 ? (
              <button
                className="primary-action"
                disabled={step === 1 && !canContinueAddress}
                type="button"
                onClick={nextStep}
              >
                Weiter
              </button>
            ) : (
              <button className="primary-action" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Wird bestätigt' : 'Bestellung bestätigen'}
              </button>
            )}
          </div>
        </aside>
      </form>
    </section>
  )
}
