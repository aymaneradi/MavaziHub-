import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOrderHistory } from '../api/orderApi'
import { useAuth } from '../auth/AuthContext'
import type { OrderSummary } from '../types/Order'

function OrdersPage() {
  const { isAuthenticated, isInitializing } = useAuth()
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCurrentRequest = true

    async function loadOrders() {
      if (!isAuthenticated) {
        setOrders([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const orderData = await getOrderHistory()

        if (isCurrentRequest) {
          setOrders(orderData)
        }
      } catch {
        if (isCurrentRequest) {
          setError('Bestellungen konnten nicht geladen werden.')
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false)
        }
      }
    }

    loadOrders()

    return () => {
      isCurrentRequest = false
    }
  }, [isAuthenticated])

  return (
    <section className="page-section">
      <div className="page-heading">
        <p>Bestellhistorie</p>
        <h1>Meine Bestellungen</h1>
        <span>Hier werden die Bestellungen des eingeloggten Kunden ueber `/api/me/orders` geladen.</span>
      </div>

      {isInitializing && <p className="status-message">Sitzung wird geprueft...</p>}

      {!isInitializing && !isAuthenticated && (
        <div className="empty-panel">
          <h2>Bitte anmelden</h2>
          <p>Deine Bestellhistorie ist nur mit einem Kundenkonto sichtbar.</p>
          <Link className="primary-link-button" to="/login">
            Zum Login
          </Link>
        </div>
      )}

      {!isInitializing && isAuthenticated && isLoading && (
        <p className="status-message">Bestellungen werden geladen...</p>
      )}

      {!isInitializing && isAuthenticated && error && (
        <p className="status-message status-message-error">{error}</p>
      )}

      {!isInitializing && isAuthenticated && !isLoading && !error && orders.length === 0 && (
        <div className="empty-panel">
          <h2>Noch keine Bestellungen</h2>
          <p>Wenn du spaeter eine Bestellung abschliesst, erscheint sie hier.</p>
          <Link className="primary-link-button" to="/products">
            Produkte entdecken
          </Link>
        </div>
      )}

      {!isInitializing && isAuthenticated && !isLoading && !error && orders.length > 0 && (
        <div className="order-list">
          {orders.map((order) => (
            <Link className="order-card" key={order.id} to={`/orders/${order.id}`}>
              <div>
                <p className="eyebrow">{formatDate(order.orderDate ?? order.createdAt ?? order.orderedAt)}</p>
                <h2>{order.orderNumber ?? `Bestellung ${order.id}`}</h2>
                <span>{order.itemCount ?? 0} Artikel</span>
              </div>

              <div className="order-card-meta">
                <span>{order.status ?? 'Status offen'}</span>
                <strong>{formatPrice(order.totalPrice ?? order.totalAmount)}</strong>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

function formatDate(dateValue?: string | null) {
  if (!dateValue) {
    return 'Datum offen'
  }

  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
  }).format(new Date(dateValue))
}

function formatPrice(price?: number | null) {
  if (price == null) {
    return 'Summe offen'
  }

  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

export default OrdersPage
