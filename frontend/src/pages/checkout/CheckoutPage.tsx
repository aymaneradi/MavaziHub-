import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { axiosClient } from '../../api/axiosClient'
import { checkout } from '../../api/checkoutApi'

const CUSTOMER_ID = '00000000-0000-0000-0000-000000000001'

interface CartItem { id: string; productName: string; unitPrice: number; quantity: number; subtotal: number }
interface Cart { customerId: string; items: CartItem[]; totalPrice: number }

const CheckoutPage = () => {
  const navigate = useNavigate()
  const [cart, setCart] = useState<Cart | null>(null)
  const [street, setStreet] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    axiosClient.get<Cart>('/cart', { params: { customerId: CUSTOMER_ID } })
      .then(r => setCart(r.data))
      .catch(() => setError('Warenkorb konnte nicht geladen werden.'))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await checkout({ customerId: CUSTOMER_ID, street, zipCode, city })
      navigate('/orders', { state: { successMessage: 'Bestellung erfolgreich aufgegeben!' } })
    } catch {
      setError('Bestellung fehlgeschlagen. Bitte erneut versuchen.')
    } finally { setLoading(false) }
  }

  if (!cart) return <div style={{ padding: '2rem', textAlign: 'center' }}>Laden...</div>
  if (cart.items.length === 0) return <div style={{ padding: '2rem' }}>Warenkorb ist leer.</div>

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      <div style={{ flex: 2, minWidth: '300px' }}>
        <h2>Ihre Artikel</h2>
        {cart.items.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
            <span>{item.productName} x{item.quantity}</span>
            <span>{item.subtotal.toFixed(2)} €</span>
          </div>
        ))}
        <div style={{ marginTop: '1rem', fontWeight: 'bold', textAlign: 'right' }}>Gesamt: {cart.totalPrice.toFixed(2)} €</div>
      </div>
      <div style={{ flex: 1, minWidth: '250px' }}>
        <h2>Lieferadresse</h2>
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Straße</label>
            <input value={street} onChange={e => setStreet(e.target.value)} required style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.3rem', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1 }}>
              <label>PLZ</label>
              <input value={zipCode} onChange={e => setZipCode(e.target.value)} required style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.3rem', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div style={{ flex: 2 }}>
              <label>Stadt</label>
              <input value={city} onChange={e => setCity(e.target.value)} required style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.3rem', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', background: '#198754', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}>
            {loading ? 'Wird aufgegeben...' : 'Jetzt bestellen'}
          </button>
        </form>
      </div>
    </div>
  )
}
export default CheckoutPage
