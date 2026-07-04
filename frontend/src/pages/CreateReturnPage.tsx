import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getOrderById } from '../api/orderApi'
import { createReturnRequest, getReturnableItems } from '../api/returnApi'
import { useAuth } from '../auth/AuthContext'
import type { ReturnableOrderItem } from '../types/ReturnRequest'

type SelectedReturnItem = {
  quantity: number
}

function CreateReturnPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, isInitializing } = useAuth()
  const [items, setItems] = useState<ReturnableOrderItem[]>([])
  const [selectedItems, setSelectedItems] = useState<Record<string, SelectedReturnItem>>({})
  const [generalReason, setGeneralReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedItemCount = useMemo(() => Object.keys(selectedItems).length, [selectedItems])

  useEffect(() => {
    let isCurrentRequest = true

    async function loadReturnableItems() {
      if (!isAuthenticated || !orderId) {
        setItems([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const itemData = await loadReturnableItemsFromApi(orderId)

        if (isCurrentRequest) {
          setItems(itemData)
        }
      } catch {
        if (isCurrentRequest) {
          setError('Ruecksendbare Artikel konnten nicht geladen werden.')
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false)
        }
      }
    }

    loadReturnableItems()

    return () => {
      isCurrentRequest = false
    }
  }, [isAuthenticated, orderId])

  function toggleItem(item: ReturnableOrderItem) {
    setSelectedItems((currentItems) => {
      if (currentItems[item.orderItemId]) {
        const nextItems = { ...currentItems }
        delete nextItems[item.orderItemId]
        return nextItems
      }

      return {
        ...currentItems,
        [item.orderItemId]: {
          quantity: 1,
        },
      }
    })
  }

  function updateQuantity(item: ReturnableOrderItem, quantity: number) {
    const safeQuantity = Math.max(1, Math.min(quantity, item.returnableQuantity))

    setSelectedItems((currentItems) => ({
      ...currentItems,
      [item.orderItemId]: {
        ...currentItems[item.orderItemId],
        quantity: safeQuantity,
      },
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!orderId || selectedItemCount === 0) {
      setError('Bitte waehle mindestens einen Artikel fuer die Ruecksendung aus.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const createdReturn = await createReturnRequest(orderId, {
        reason: generalReason,
        items: Object.entries(selectedItems).map(([orderItemId, item]) => ({
          orderItemId,
          quantity: item.quantity,
        })),
      })

      navigate(`/returns/${createdReturn.id}`)
    } catch {
      setError('Ruecksendung konnte nicht erstellt werden.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-section">
      <Link className="secondary-link" to={orderId ? `/orders/${orderId}` : '/orders'}>
        Zurueck zur Bestellung
      </Link>

      <div className="page-heading">
        <p>Ruecksendung</p>
        <h1>Ruecksendung vorbereiten</h1>
        <span>Waehle die Artikel aus, die du zuruecksenden moechtest.</span>
      </div>

      {isInitializing && <p className="status-message">Sitzung wird geprueft...</p>}

      {!isInitializing && !isAuthenticated && (
        <div className="empty-panel">
          <h2>Bitte anmelden</h2>
          <p>Ruecksendungen koennen nur mit einem Kundenkonto erstellt werden.</p>
          <Link className="primary-link-button" to="/login">
            Zum Login
          </Link>
        </div>
      )}

      {!isInitializing && isAuthenticated && isLoading && (
        <p className="status-message">Ruecksendbare Artikel werden geladen...</p>
      )}

      {!isInitializing && isAuthenticated && error && (
        <p className="status-message status-message-error">{error}</p>
      )}

      {!isInitializing && isAuthenticated && !isLoading && !error && items.length === 0 && (
        <div className="empty-panel">
          <h2>Keine Artikel verfuegbar</h2>
          <p>Fuer diese Bestellung gibt es aktuell keine ruecksendbaren Artikel.</p>
        </div>
      )}

      {!isInitializing && isAuthenticated && !isLoading && items.length > 0 && (
        <form className="return-form" onSubmit={handleSubmit}>
          <label>
            Allgemeiner Ruecksendegrund
            <textarea
              required
              value={generalReason}
              placeholder="z.B. falsche Groesse, beschaedigt, gefaellt nicht"
              onChange={(event) => setGeneralReason(event.target.value)}
            />
          </label>

          <div className="returnable-list">
            {items.map((item) => {
              const selectedItem = selectedItems[item.orderItemId]
              const isSelected = Boolean(selectedItem)

              return (
                <article className="returnable-card" key={item.orderItemId}>
                  <label className="returnable-check">
                    <input
                      checked={isSelected}
                      type="checkbox"
                      onChange={() => toggleItem(item)}
                    />
                    <span>
                      <strong>{item.productName ?? `Artikel ${item.orderItemId}`}</strong>
                      <small>
                        Ruecksendbar: {item.returnableQuantity} von{' '}
                        {item.orderedQuantity ?? item.returnableQuantity}
                      </small>
                    </span>
                  </label>

                  {isSelected && (
                    <div className="returnable-fields">
                      <label>
                        Menge
                        <input
                          min={1}
                          max={item.returnableQuantity}
                          type="number"
                          value={selectedItem.quantity}
                          onChange={(event) => updateQuantity(item, Number(event.target.value))}
                        />
                      </label>
                    </div>
                  )}
                </article>
              )
            })}
          </div>

          <button className="primary-button" type="submit" disabled={isSubmitting || selectedItemCount === 0}>
            {isSubmitting ? 'Ruecksendung wird erstellt...' : 'Ruecksendung erstellen'}
          </button>
        </form>
      )}
    </section>
  )
}

async function loadReturnableItemsFromApi(orderId: string): Promise<ReturnableOrderItem[]> {
  try {
    return await getReturnableItems(orderId)
  } catch {
    const order = await getOrderById(orderId)

    return (order.items ?? [])
      .filter((item) => (item.returnableQuantity ?? 0) > 0)
      .map((item) => ({
        orderItemId: item.id,
        productId: item.productId,
        productName: item.productName,
        orderedQuantity: item.quantity,
        returnableQuantity: item.returnableQuantity ?? 0,
        unitPrice: item.unitPrice,
      }))
  }
}

export default CreateReturnPage
