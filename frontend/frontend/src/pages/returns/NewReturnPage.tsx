import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { orderApi, returnApi } from '../../api'
import type { FormEvent } from 'react'
import type { OrderResponse, ReturnRequestResponseDTO, UUID } from '../../types'

const formatCurrency = (value: number) =>
  value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
  }).format(new Date(value))

const returnStatusLabel = (status: string) =>
  ({
    REQUESTED: 'Beantragt',
    IN_REVIEW: 'In Prüfung',
    APPROVED: 'Genehmigt',
    REJECTED: 'Abgelehnt',
    RECEIVED: 'Eingegangen',
    REFUNDED: 'Erstattet',
    COMPLETED: 'Abgeschlossen',
  })[status] ?? status

export function NewReturnPage() {
  const [searchParams] = useSearchParams()
  const initialOrderId = searchParams.get('orderId') ?? ''

  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<UUID>(initialOrderId)
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null)
  const [quantities, setQuantities] = useState<Record<UUID, number>>({})
  const [reason, setReason] = useState('')
  const [createdReturn, setCreatedReturn] = useState<ReturnRequestResponseDTO | null>(null)
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [isLoadingOrder, setIsLoadingOrder] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await orderApi.getMyOrders()
        setOrders(response)

        if (!initialOrderId && response.length > 0) {
          setSelectedOrderId(response[0].id)
        }
      } catch {
        setMessage('Die Bestellungen konnten gerade nicht geladen werden.')
      } finally {
        setIsLoadingOrders(false)
      }
    }

    void loadOrders()
  }, [initialOrderId])

  useEffect(() => {
    async function loadOrder(orderId: UUID) {
      setIsLoadingOrder(true)
      setMessage('')

      try {
        const response = await orderApi.getOrder(orderId)
        setSelectedOrder(response)
        setQuantities(
          Object.fromEntries(response.items.map((item) => [item.id, 0])) as Record<UUID, number>,
        )
      } catch {
        setSelectedOrder(null)
        setMessage('Die ausgewählte Bestellung konnte nicht geladen werden.')
      } finally {
        setIsLoadingOrder(false)
      }
    }

    if (selectedOrderId) {
      void loadOrder(selectedOrderId)
    }
  }, [selectedOrderId])

  const selectedItems = useMemo(
    () =>
      selectedOrder?.items
        .map((item) => ({
          orderItemId: item.id,
          quantity: quantities[item.id] ?? 0,
        }))
        .filter((item) => item.quantity > 0) ?? [],
    [quantities, selectedOrder],
  )

  async function submitReturn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedOrder || selectedItems.length === 0) {
      setMessage('Bitte wähle mindestens einen Artikel für die Rücksendung aus.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await returnApi.createReturn({
        orderId: selectedOrder.id,
        reason: reason.trim() || undefined,
        items: selectedItems,
      })
      setCreatedReturn(response)
    } catch {
      setMessage('Die Rücksendung konnte nicht angefordert werden.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (createdReturn) {
    return (
      <section className="account-page">
        <div className="confirmation-panel">
          <p className="eyebrow">Rücksendung</p>
          <h1>Rücksendung angefordert</h1>
          <p>Wir haben deine Rücksendung aufgenommen. Den aktuellen Stand findest du in deiner Übersicht.</p>
          <dl>
            <div>
              <dt>Rücksendenummer</dt>
              <dd>{createdReturn.id}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{returnStatusLabel(createdReturn.status)}</dd>
            </div>
            <div>
              <dt>Artikel</dt>
              <dd>{createdReturn.items.reduce((sum, item) => sum + item.quantity, 0)}</dd>
            </div>
          </dl>
          <Link to="/returns">Meine Rücksendungen</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="account-page">
      <div className="commerce-header">
        <div>
          <p className="eyebrow">Rücksendung</p>
          <h1>Rücksendung anfordern</h1>
          <p>Wähle die Bestellung und die Artikel aus, die du zurücksenden möchtest.</p>
        </div>
        <Link to="/returns">Zur Übersicht</Link>
      </div>

      {message && <p className="commerce-message" role="status">{message}</p>}

      {isLoadingOrders ? (
        <div className="commerce-empty">
          <h2>Bestellungen werden geladen</h2>
        </div>
      ) : orders.length === 0 ? (
        <div className="commerce-empty">
          <h2>Keine Bestellung vorhanden</h2>
          <p>Eine Rücksendung kann erst nach einer Bestellung angefordert werden.</p>
          <Link to="/products">Produkte ansehen</Link>
        </div>
      ) : (
        <form className="return-form-layout" onSubmit={submitReturn}>
          <div className="checkout-panel">
            <label className="return-order-select">
              <span>Bestellung</span>
              <select
                value={selectedOrderId}
                onChange={(event) => setSelectedOrderId(event.target.value)}
              >
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    #{order.id.slice(0, 8)} · {formatDate(order.orderDate)} ·{' '}
                    {formatCurrency(order.totalPrice)}
                  </option>
                ))}
              </select>
            </label>

            {isLoadingOrder ? (
              <div className="commerce-empty inline-empty">
                <h2>Bestellung wird geladen</h2>
              </div>
            ) : selectedOrder ? (
              <>
                <div className="return-lines">
                  {selectedOrder.items.map((item) => (
                    <article className="return-line" key={item.id}>
                      <div>
                        <h2>{item.productName}</h2>
                        <p>
                          Gekauft: {item.quantity} · Einzelpreis {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <label>
                        <span>Menge</span>
                        <input
                          min="0"
                          max={item.quantity}
                          type="number"
                          value={quantities[item.id] ?? 0}
                          onChange={(event) => {
                            const nextValue = Number(event.target.value)

                            if (!Number.isInteger(nextValue)) {
                              return
                            }

                            setQuantities((current) => ({
                              ...current,
                              [item.id]: Math.min(Math.max(nextValue, 0), item.quantity),
                            }))
                          }}
                        />
                      </label>
                    </article>
                  ))}
                </div>

                <label className="return-reason">
                  <span>Grund optional</span>
                  <textarea
                    rows={4}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                  />
                </label>
              </>
            ) : null}
          </div>

          <aside className="cart-summary">
            <h2>Rücksendung</h2>
            <dl>
              <div>
                <dt>Ausgewählte Artikel</dt>
                <dd>{selectedItems.reduce((sum, item) => sum + item.quantity, 0)}</dd>
              </div>
              <div>
                <dt>Bestellung</dt>
                <dd>{selectedOrder ? `#${selectedOrder.id.slice(0, 8)}` : '-'}</dd>
              </div>
            </dl>
            <button className="primary-action" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Wird abgesendet' : 'Rücksendung absenden'}
            </button>
          </aside>
        </form>
      )}
    </section>
  )
}
