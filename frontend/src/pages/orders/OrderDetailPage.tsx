import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrderById } from '../../api/orderApi'
import { Order } from '../../types/Order'

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getOrderById(id).then(setOrder).catch(() => setError('Bestellung nicht gefunden.'))
  }, [id])

  if (error) return <div style={{ padding: '2rem' }}>{error} <button onClick={() => navigate('/orders')}>Zurück</button></div>
  if (!order) return <div style={{ padding: '2rem', textAlign: 'center' }}>Laden...</div>

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <button onClick={() => navigate('/orders')} style={{ background: 'transparent', border: '1px solid #ccc', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', marginBottom: '1rem' }}>← Zurück</button>
      <h2>Bestelldetails</h2>
      <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <p><strong>ID:</strong> {order.id}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Zahlung:</strong> {order.paymentStatus}</p>
        <p><strong>Datum:</strong> {new Date(order.orderDate).toLocaleDateString('de-DE')}</p>
        {order.street && <p><strong>Adresse:</strong> {order.street}, {order.zipCode} {order.city}</p>}
      </div>
      <h4>Artikel</h4>
      {order.items.map(item => (
        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
          <span>{item.productName} x{item.quantity}</span>
          <span>{(item.unitPrice * item.quantity).toFixed(2)} €</span>
        </div>
      ))}
      <div style={{ textAlign: 'right', marginTop: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>Gesamt: {order.totalPrice.toFixed(2)} €</div>
    </div>
  )
}
export default OrderDetailPage
