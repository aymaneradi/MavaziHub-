import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { clearCart, getCart, removeCartItem, updateCartItemQuantity } from '../api/cartApi'
import { useAuth } from '../auth/AuthContext'
import type { Cart } from '../types/Cart'

function CartPage() {
  const { currentUser, isAuthenticated, isInitializing } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCurrentRequest = true

    async function loadCart() {
      if (!currentUser) {
        setCart(null)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const cartData = await getCart()

        if (isCurrentRequest) {
          setCart(cartData)
        }
      } catch {
        if (isCurrentRequest) {
          setError('Warenkorb konnte nicht geladen werden.')
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false)
        }
      }
    }

    loadCart()

    return () => {
      isCurrentRequest = false
    }
  }, [currentUser])

  async function handleQuantityChange(itemId: string, quantity: number) {
    try {
      const updatedCart = await updateCartItemQuantity(itemId, quantity)
      setCart(updatedCart)
    } catch {
      setError('Menge konnte nicht aktualisiert werden.')
    }
  }

  async function handleRemoveItem(itemId: string) {
    try {
      const updatedCart = await removeCartItem(itemId)
      setCart(updatedCart)
    } catch {
      setError('Artikel konnte nicht entfernt werden.')
    }
  }

  async function handleClearCart() {
    if (!currentUser) {
      return
    }

    try {
      await clearCart()
      setCart({ customerId: currentUser.id, items: [], totalPrice: 0 })
    } catch {
      setError('Warenkorb konnte nicht geleert werden.')
    }
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <p>Warenkorb</p>
        <h1>Dein Warenkorb</h1>
        <span>Hier werden deine ausgewaehlten Produkte angezeigt.</span>
      </div>

      {isInitializing && <p className="status-message">Sitzung wird geprueft...</p>}

      {!isInitializing && !isAuthenticated && (
        <div className="empty-panel">
          <h2>Bitte anmelden</h2>
          <p>Dein Warenkorb ist aktuell an dein Kundenkonto gekoppelt.</p>
          <Link className="primary-link-button" to="/login">
            Zum Login
          </Link>
        </div>
      )}

      {!isInitializing && isAuthenticated && isLoading && (
        <p className="status-message">Warenkorb wird geladen...</p>
      )}

      {!isInitializing && isAuthenticated && error && (
        <p className="status-message status-message-error">{error}</p>
      )}

      {!isInitializing && isAuthenticated && !isLoading && !error && cart?.items.length === 0 && (
        <div className="empty-panel">
          <h2>Dein Warenkorb ist leer</h2>
          <p>Lege ein Produkt in den Warenkorb, um spaeter eine Bestellung zu erstellen.</p>
          <Link className="primary-link-button" to="/products">
            Produkte entdecken
          </Link>
        </div>
      )}

      {!isInitializing && isAuthenticated && !isLoading && cart && cart.items.length > 0 && (
        <div className="cart-layout">
          <div className="cart-item-list">
            {cart.items.map((item) => (
              <article className="cart-item-card" key={item.id}>
                <div>
                  <h2>{item.productName}</h2>
                  <p>{formatPrice(item.unitPrice)} pro Stueck</p>
                </div>

                <label>
                  Menge
                  <input
                    min={0}
                    type="number"
                    value={item.quantity}
                    onChange={(event) => handleQuantityChange(item.id, Number(event.target.value))}
                  />
                </label>

                <strong>{formatPrice(item.subtotal)}</strong>

                <button type="button" onClick={() => handleRemoveItem(item.id)}>
                  Entfernen
                </button>
              </article>
            ))}
          </div>

          <aside className="cart-summary">
            <h2>Zusammenfassung</h2>
            <div>
              <span>Gesamt</span>
              <strong>{formatPrice(cart.totalPrice)}</strong>
            </div>
            <Link className="primary-link-button" to="/checkout">
              Zur Kasse
            </Link>
            <button className="secondary-button" type="button" onClick={handleClearCart}>
              Warenkorb leeren
            </button>
          </aside>
        </div>
      )}
    </section>
  )
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

export default CartPage
