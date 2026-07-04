import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { cartApi } from '../../api'
import type { CartResponse, UUID } from '../../types'

const formatCurrency = (value: number) =>
  value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })

export function CartPage() {
  const [cart, setCart] = useState<CartResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeItemId, setActiveItemId] = useState<UUID | null>(null)
  const [message, setMessage] = useState('')

  async function loadCart() {
    setIsLoading(true)
    setMessage('')

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
      setCart(response)
    } catch {
      setMessage('Die Menge konnte nicht aktualisiert werden.')
    } finally {
      setActiveItemId(null)
    }
  }

  async function removeItem(itemId: UUID) {
    setActiveItemId(itemId)
    setMessage('')

    try {
      const response = await cartApi.removeItem(itemId)
      setCart(response)
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
      setCart({ items: [], totalPrice: 0 })
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
          <p className="eyebrow">Kundenbereich</p>
          <h1>Warenkorb</h1>
          <p>Prüfe deine Auswahl, passe Mengen an und starte anschließend den Checkout.</p>
        </div>
        <Link to="/products">Weiter einkaufen</Link>
      </div>

      {message && <p className="commerce-message" role="status">{message}</p>}

      {isLoading ? (
        <div className="commerce-empty">
          <h2>Warenkorb wird geladen</h2>
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
                    min="1"
                    type="number"
                    value={item.quantity}
                    onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
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
                <dd>Im Checkout</dd>
              </div>
            </dl>
            <Link className="primary-action" to="/checkout">
              Checkout starten
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
