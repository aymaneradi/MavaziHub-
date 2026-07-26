import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { cartApi } from '../../api'
import type { CartResponse, UUID } from '../../types'

const formatCurrency = (value: number) =>
  value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })

export function CartPage() {
  const [cart, setCart] = useState<CartResponse | null>(null)
  const [quantityDrafts, setQuantityDrafts] = useState<Record<UUID, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [activeItemId, setActiveItemId] = useState<UUID | null>(null)
  const [message, setMessage] = useState('')

  function applyCart(nextCart: CartResponse) {
    setCart(nextCart)
    setQuantityDrafts(
      Object.fromEntries(nextCart.items.map((item) => [item.id, String(item.quantity)])),
    )
  }

  async function loadCart() {
    setIsLoading(true)
    setMessage('')

    try {
      const response = await cartApi.getCart()
      applyCart(response)
    } catch {
      setMessage('Der Warenkorb konnte gerade nicht geladen werden.')
      applyCart({ items: [], totalPrice: 0 })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadCart()
  }, [])

  async function updateQuantity(itemId: UUID, quantity: number) {
    if (!Number.isInteger(quantity) || quantity < 1) {
      return
    }

    setActiveItemId(itemId)
    setMessage('')

    try {
      const response = await cartApi.updateItemQuantity(itemId, quantity)
      applyCart(response)
    } catch {
      setMessage('Die Menge konnte nicht aktualisiert werden.')
    } finally {
      setActiveItemId(null)
    }
  }

  async function commitQuantity(itemId: UUID, fallbackQuantity: number) {
    const nextQuantity = Number(quantityDrafts[itemId])

    if (!Number.isInteger(nextQuantity) || nextQuantity < 1) {
      setQuantityDrafts((current) => ({ ...current, [itemId]: String(fallbackQuantity) }))
      setMessage('Bitte gib eine Menge ab 1 ein.')
      return
    }

    if (nextQuantity !== fallbackQuantity) {
      await updateQuantity(itemId, nextQuantity)
    }
  }

  async function removeItem(itemId: UUID) {
    setActiveItemId(itemId)
    setMessage('')

    try {
      const response = await cartApi.removeItem(itemId)
      applyCart(response)
    } catch {
      setMessage('Der Artikel konnte nicht entfernt werden.')
    } finally {
      setActiveItemId(null)
    }
  }

  async function clearCart() {
    setMessage('')

    try {
      await cartApi.clearCart()
      applyCart({ items: [], totalPrice: 0 })
    } catch {
      setMessage('Der Warenkorb konnte nicht geleert werden.')
    }
  }

  const items = cart?.items ?? []
  const isEmpty = !isLoading && items.length === 0

  return (
    <section className="cart-page">
      <div className="commerce-header">
        <div>
          <p className="eyebrow">Deine Auswahl</p>
          <h1>Warenkorb</h1>
          <p>Schau dir deine Artikel an und passe die Menge bei Bedarf an.</p>
        </div>
        <Link to="/products">Weiter einkaufen</Link>
      </div>

      {message && <p className="commerce-message" role="status">{message}</p>}

      {isLoading ? (
        <div className="cart-skeleton-list" aria-label="Warenkorb wird geladen">
          {[0, 1, 2].map((item) => (
            <article className="cart-item cart-item-skeleton" key={item} aria-hidden="true">
              <span className="skeleton-line wide" />
              <span className="skeleton-line short" />
              <span className="skeleton-line short" />
              <span className="skeleton-line short" />
            </article>
          ))}
        </div>
      ) : isEmpty ? (
        <div className="commerce-empty">
          <h2>Dein Warenkorb ist leer</h2>
          <p>Entdecke Stoffe, Kleidung und Accessoires im Shop.</p>
          <Link to="/products">Produkte ansehen</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items" aria-label="Warenkorbpositionen">
            {items.map((item) => (
              <article className="cart-item" key={item.id}>
                <div>
                  <h2>{item.productName}</h2>
                  <p>
                    Einzelpreis {formatCurrency(item.unitPrice)}
                    {item.variantId ? ` · Variante #${item.variantId}` : ''}
                  </p>
                </div>

                <div className="quantity-control" aria-label={`Menge fuer ${item.productName}`}>
                  <button
                    disabled={activeItemId === item.id || item.quantity <= 1}
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <input
                    disabled={activeItemId === item.id}
                    inputMode="numeric"
                    min="1"
                    pattern="[0-9]*"
                    type="number"
                    value={quantityDrafts[item.id] ?? String(item.quantity)}
                    onBlur={() => void commitQuantity(item.id, item.quantity)}
                    onChange={(event) =>
                      setQuantityDrafts((current) => ({
                        ...current,
                        [item.id]: event.target.value.replace(/\D/g, ''),
                      }))
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.currentTarget.blur()
                      }
                    }}
                  />
                  <button
                    disabled={activeItemId === item.id}
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <strong>{formatCurrency(item.subtotal)}</strong>
                <button
                  className="text-action"
                  disabled={activeItemId === item.id}
                  type="button"
                  onClick={() => removeItem(item.id)}
                >
                  Entfernen
                </button>
              </article>
            ))}
          </div>

          <aside className="cart-summary" aria-label="Zusammenfassung">
            <h2>Zusammenfassung</h2>
            <dl>
              <div>
                <dt>Artikel</dt>
                <dd>{items.reduce((sum, item) => sum + item.quantity, 0)}</dd>
              </div>
              <div>
                <dt>Zwischensumme</dt>
                <dd>{formatCurrency(cart?.totalPrice ?? 0)}</dd>
              </div>
              <div>
                <dt>Versand</dt>
                <dd>An der Kasse</dd>
              </div>
            </dl>
            <Link className="primary-action" to="/checkout">
              Zur Kasse
            </Link>
            <button className="secondary-action" type="button" onClick={clearCart}>
              Warenkorb leeren
            </button>
          </aside>
        </div>
      )}
    </section>
  )
}
