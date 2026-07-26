import axios from 'axios'
import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { cartApi } from '../../api'
import type { CartResponse, OrderResponse } from '../../types'

type ApiErrorResponse = {
  message?: string
}

const formatCurrency = (value: number) =>
  value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })

const checkoutSteps = ['Warenkorb', 'Lieferadresse', 'Zahlungsart', 'Bestätigung']
const zipCodePattern = /^\d{5}$/
const orderStatusLabel = (status: string) =>
  ({
    CREATED: 'Angelegt',
    PAID: 'Bezahlt',
    PROCESSING: 'In Bearbeitung',
    SHIPPED: 'Versendet',
    DELIVERED: 'Geliefert',
    CANCELLED: 'Storniert',
  })[status] ?? status

function getCartLoadErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return 'Der Warenkorb konnte gerade nicht geladen werden.'
  }

  if (!error.response) {
    return 'Der Warenkorb ist gerade nicht erreichbar. Bitte versuche es gleich noch einmal.'
  }

  if (error.response.status === 401) {
    return 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.'
  }

  return 'Der Warenkorb konnte gerade nicht geladen werden.'
}

function getCheckoutErrorMessage(error: unknown) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return 'Die Bestellung ist gerade nicht möglich. Bitte versuche es gleich noch einmal.'
  }

  if (!error.response) {
    return 'Die Bestellung ist gerade nicht möglich. Bitte versuche es gleich noch einmal.'
  }

  const status = error.response.status
  const backendMessage = error.response.data?.message?.toLowerCase() ?? ''

  if (status === 401) {
    return 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.'
  }

  if (backendMessage.includes('warenkorb') && (backendMessage.includes('leer') || backendMessage.includes('empty'))) {
    return 'Dein Warenkorb ist leer.'
  }

  if (
    status === 409 ||
    backendMessage.includes('lagerbestand') ||
    backendMessage.includes('nicht genug') ||
    backendMessage.includes('nicht mehr verfügbar') ||
    backendMessage.includes('not enough') ||
    backendMessage.includes('unavailable')
  ) {
    return 'Ein Produkt ist in der gewünschten Menge nicht mehr verfügbar.'
  }

  if (status === 400) {
    return 'Bitte prüfe deine Angaben für die Bestellung.'
  }

  return 'Die Bestellung ist gerade nicht möglich. Bitte versuche es gleich noch einmal.'
}

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
      } catch (error) {
        setMessage(getCartLoadErrorMessage(error))
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
    address.street.trim().length >= 3 &&
    zipCodePattern.test(address.zipCode.trim()) &&
    address.city.trim().length >= 2

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
    } catch (error) {
      setMessage(getCheckoutErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <section className="checkout-page">
        <div className="checkout-loading-panel" aria-label="Kasse wird geladen">
          <span className="skeleton-line wide" />
          <span className="skeleton-line" />
          <span className="skeleton-box" />
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
                    autoComplete="street-address"
                    minLength={3}
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
                    autoComplete="postal-code"
                    inputMode="numeric"
                    maxLength={5}
                    pattern="[0-9]{5}"
                    required
                    value={address.zipCode}
                    onChange={(event) =>
                      setAddress((current) => ({
                        ...current,
                        zipCode: event.target.value.replace(/\D/g, '').slice(0, 5),
                      }))
                    }
                  />
                  <small className="field-help">Bitte 5 Ziffern eingeben.</small>
                </label>
                <label>
                  <span>Stadt</span>
                  <input
                    autoComplete="address-level2"
                    minLength={2}
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
