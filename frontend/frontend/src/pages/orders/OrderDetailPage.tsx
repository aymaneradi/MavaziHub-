import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { orderApi } from '../../api'
import type { OrderResponse, UUID } from '../../types'

const formatCurrency = (value: number) =>
  value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

const statusLabel = (status: string) =>
  ({
    CREATED: 'Angelegt',
    PAID: 'Bezahlt',
    PROCESSING: 'In Bearbeitung',
    SHIPPED: 'Versendet',
    DELIVERED: 'Geliefert',
    CANCELLED: 'Storniert',
  })[status] ?? status

export function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadOrder(orderId: UUID) {
      try {
        const response = await orderApi.getOrder(orderId)
        setOrder(response)
      } catch {
        setMessage('Diese Bestellung konnte gerade nicht geladen werden.')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      void loadOrder(id)
    } else {
      setIsLoading(false)
      setMessage('Es wurde keine Bestellung ausgewählt.')
    }
  }, [id])

  return (
    <section className="account-page">
      <div className="commerce-header">
        <div>
          <p className="eyebrow">Bestellung</p>
          <h1>{order ? `Bestellung #${order.id.slice(0, 8)}` : 'Bestellung'}</h1>
          <p>Alle Informationen zu deiner Bestellung im Überblick.</p>
        </div>
        <Link to="/orders">Zu meinen Bestellungen</Link>
      </div>

      {message && <p className="commerce-message" role="status">{message}</p>}

      {isLoading ? (
        <div className="commerce-empty">
          <h2>Bestellung wird geladen</h2>
        </div>
      ) : order ? (
        <div className="order-detail-layout">
          <div className="checkout-panel">
            <div className="order-detail-head">
              <span className="status-pill">{statusLabel(order.status)}</span>
              <span className="status-pill muted">Zahlung: {statusLabel(order.paymentStatus)}</span>
            </div>

            <dl className="order-detail-facts">
              <div>
                <dt>Bestelldatum</dt>
                <dd>{formatDate(order.orderDate)}</dd>
              </div>
              <div>
                <dt>Bestellnummer</dt>
                <dd>{order.id}</dd>
              </div>
            </dl>

            <div className="order-lines">
              {order.items.map((item) => (
                <article className="order-line" key={item.id}>
                  <div>
                    <h2>{item.productName}</h2>
                    <p>
                      Menge {item.quantity}
                      {item.variantId ? ` · Variante #${item.variantId}` : ''}
                    </p>
                  </div>
                  <strong>{formatCurrency(item.unitPrice * item.quantity)}</strong>
                </article>
              ))}
            </div>
          </div>

          <aside className="cart-summary">
            <h2>Summe</h2>
            <dl>
              <div>
                <dt>Positionen</dt>
                <dd>{order.items.length}</dd>
              </div>
              <div>
                <dt>Gesamtbetrag</dt>
                <dd>{formatCurrency(order.totalPrice)}</dd>
              </div>
            </dl>
            <Link className="primary-action" to={`/returns/new?orderId=${order.id}`}>
              Rücksendung anfordern
            </Link>
          </aside>
        </div>
      ) : null}
    </section>
  )
}
