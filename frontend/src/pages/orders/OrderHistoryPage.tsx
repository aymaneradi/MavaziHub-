import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getMyOrders } from '../../api/orderApi'
import { Order } from '../../types/Order'
import OrderCard from '../../components/orders/OrderCard'

const CUSTOMER_ID = '00000000-0000-0000-0000-000000000001'

const OrderHistoryPage = () => {
  const location = useLocation()
  const successMessage = (location.state as { successMessage?: string })?.successMessage
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMyOrders(CUSTOMER_ID)
      .then(setOrders)
      .catch(() => setError('Bestellungen konnten nicht geladen werden.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Laden...</div>

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <h2>Meine Bestellungen</h2>
      {successMessage && <div style={{ background: '#d1e7dd', color: '#0a3622', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>✅ {successMessage}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!error && orders.length === 0 && <div style={{ color: '#6c757d' }}>Keine Bestellungen vorhanden.</div>}
      {orders.map(order => <OrderCard key={order.id} order={order} />)}
    </div>
  )
}
export default OrderHistoryPage
