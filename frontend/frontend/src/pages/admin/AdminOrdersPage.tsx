import { useEffect, useState } from 'react'

import { adminApi } from '../../api'
import { useAuth } from '../../auth/AuthContext'
import type { OrderResponse } from '../../types'

const orderStatuses = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const formatCurrency = (value: number) =>
  value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  )

export function AdminOrdersPage() {
  const auth = useAuth()
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [statusDrafts, setStatusDrafts] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const areaLabel = auth.hasAnyRole(['ROLE_ADMIN']) ? 'Adminbereich' : 'Mitarbeiterbereich'

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await adminApi.getOrders()
        setOrders(response)
        setStatusDrafts(Object.fromEntries(response.map((order) => [order.id, order.status])))
      } catch {
        setMessage('Bestellungen konnten nicht geladen werden.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadOrders()
  }, [])

  async function updateStatus(orderId: string) {
    setMessage('')

    try {
      const updated = await adminApi.updateOrderStatus(orderId, statusDrafts[orderId])
      setOrders((current) => current.map((order) => (order.id === orderId ? updated : order)))
    } catch {
      setMessage('Bestellstatus konnte nicht gespeichert werden.')
    }
  }

  return (
    <section className="admin-workspace">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">{areaLabel}</p>
          <h1>Bestellungen</h1>
          <p>Status prüfen und Bestellungen fachlich weiterführen.</p>
        </div>
      </div>

      {message && <p className="admin-message" role="status">{message}</p>}

      <div className="admin-panel">
        {isLoading ? (
          <p className="admin-muted">Bestellungen werden geladen.</p>
        ) : orders.length === 0 ? (
          <p className="admin-muted">Noch keine Bestellungen vorhanden.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Bestellung</th>
                  <th>Datum</th>
                  <th>Summe</th>
                  <th>Status</th>
                  <th>Aktion</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>#{order.id.slice(0, 8)}</strong>
                      <small>{order.items.length} Positionen</small>
                    </td>
                    <td>{formatDate(order.orderDate)}</td>
                    <td>{formatCurrency(order.totalPrice)}</td>
                    <td>
                      <select
                        value={statusDrafts[order.id] ?? order.status}
                        onChange={(event) =>
                          setStatusDrafts((current) => ({
                            ...current,
                            [order.id]: event.target.value,
                          }))
                        }
                      >
                        {orderStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button type="button" onClick={() => updateStatus(order.id)}>
                          Speichern
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
