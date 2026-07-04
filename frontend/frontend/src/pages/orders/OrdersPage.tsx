import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { orderApi } from '../../api'
import type { OrderResponse } from '../../types'

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

export function OrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await orderApi.getMyOrders()
        setOrders(response)
      } catch {
        setMessage('Die Bestellhistorie konnte gerade nicht geladen werden.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadOrders()
  }, [])

  return (
    <section className="account-page">
      <div className="commerce-header">
        <div>
          <p className="eyebrow">Kundenkonto</p>
          <h1>Bestellhistorie</h1>
          <p>Alle abgeschlossenen Bestellungen mit Status, Summe und Detailansicht.</p>
        </div>
        <Link to="/products">Weiter einkaufen</Link>
      </div>

      {message && <p className="commerce-message" role="status">{message}</p>}

      {isLoading ? (
        <div className="commerce-empty">
          <h2>Bestellungen werden geladen</h2>
        </div>
      ) : orders.length === 0 ? (
        <div className="commerce-empty">
          <h2>Noch keine Bestellungen</h2>
          <p>Sobald du den Checkout abschließt, erscheint deine Bestellung hier.</p>
          <Link to="/products">Produkte ansehen</Link>
        </div>
      ) : (
        <div className="account-list">
          {orders.map((order) => (
            <article className="account-card" key={order.id}>
              <div>
                <span className="status-pill">{statusLabel(order.status)}</span>
                <h2>Bestellung #{order.id.slice(0, 8)}</h2>
                <p>
                  {formatDate(order.orderDate)} · {order.items.length} Position
                  {order.items.length === 1 ? '' : 'en'}
                </p>
              </div>
              <div className="account-card-meta">
                <strong>{formatCurrency(order.totalPrice)}</strong>
                <Link to={`/orders/${order.id}`}>Details ansehen</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
