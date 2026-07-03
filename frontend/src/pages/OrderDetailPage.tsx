import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOrderById } from '../api/orderApi'
import { useAuth } from '../auth/AuthContext'
import type { OrderDetail } from '../types/Order'

function OrderDetailPage() {
  const { orderId } = useParams()
  const { isAuthenticated, isInitializing } = useAuth()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasReturnableItems = order?.items?.some((item) => (item.returnableQuantity ?? 0) > 0) ?? false

  useEffect(() => {
    let isCurrentRequest = true

    async function loadOrder() {
      if (!isAuthenticated || !orderId) {
        setOrder(null)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const orderData = await getOrderById(orderId)

        if (isCurrentRequest) {
          setOrder(orderData)
        }
      } catch {
        if (isCurrentRequest) {
          setError('Bestelldetails konnten nicht geladen werden.')
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false)
        }
      }
    }

    loadOrder()

    return () => {
      isCurrentRequest = false
    }
  }, [isAuthenticated, orderId])

  return (
    <section className="page-section">
      <Link className="secondary-link" to="/orders">
        Zurueck zur Bestellhistorie
      </Link>

      <div className="page-heading">
        <p>Bestelldetails</p>
        <h1>{order?.orderNumber ?? 'Bestellung'}</h1>
        <span>Hier werden die Details einer einzelnen Bestellung angezeigt.</span>
      </div>

      {isInitializing && <p className="status-message">Sitzung wird geprueft...</p>}

      {!isInitializing && !isAuthenticated && (
        <div className="empty-panel">
          <h2>Bitte anmelden</h2>
          <p>Bestelldetails sind nur mit einem Kundenkonto sichtbar.</p>
          <Link className="primary-link-button" to="/login">
            Zum Login
          </Link>
        </div>
      )}

      {!isInitializing && isAuthenticated && isLoading && (
        <p className="status-message">Bestelldetails werden geladen...</p>
      )}

      {!isInitializing && isAuthenticated && error && (
        <p className="status-message status-message-error">{error}</p>
      )}

      {!isInitializing && isAuthenticated && !isLoading && !error && order && (
        <div className="order-detail-layout">
          <section className="order-detail-summary">
            <h2>Uebersicht</h2>
            <dl className="detail-list">
              <div>
                <dt>Datum</dt>
                <dd>{formatDate(order.orderDate ?? order.createdAt ?? order.orderedAt)}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{order.status ?? 'Status offen'}</dd>
              </div>
              <div>
                <dt>Zahlung</dt>
                <dd>{order.paymentStatus ?? 'Zahlstatus offen'}</dd>
              </div>
              <div>
                <dt>Summe</dt>
                <dd>{formatPrice(order.totalPrice ?? order.totalAmount)}</dd>
              </div>
            </dl>
          </section>

          <section className="order-items-section">
            <div className="section-heading">
              <h2>Artikel</h2>
              {hasReturnableItems ? (
                <Link to={`/orders/${order.id}/returns`}>Ruecksendung vorbereiten</Link>
              ) : (
                <span>Keine ruecksendbaren Artikel</span>
              )}
            </div>

            {order.items && order.items.length > 0 ? (
              <div className="order-item-list">
                {order.items.map((item) => (
                  <article className="order-item-card" key={item.id}>
                    <div>
                      <h3>{item.productName ?? `Artikel ${item.id}`}</h3>
                      <p>Menge: {item.quantity}</p>
                      <p>Ruecksendbar: {item.returnableQuantity ?? 0}</p>
                    </div>
                    <strong>{formatPrice(item.totalPrice ?? calculateItemTotal(item.unitPrice, item.quantity))}</strong>
                  </article>
                ))}
              </div>
            ) : (
              <p className="status-message">Keine Artikel fuer diese Bestellung gefunden.</p>
            )}
          </section>
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

function calculateItemTotal(unitPrice?: number | null, quantity = 1) {
  if (unitPrice == null) {
    return null
  }

  return unitPrice * quantity
}

export default OrderDetailPage
