import { useNavigate } from 'react-router-dom'
import { Order } from '../../types/Order'

interface Props { order: Order }

const OrderCard = ({ order }: Props) => {
  const navigate = useNavigate()
  return (
    <div style={{ border: '1px solid #dee2e6', borderRadius: '8px', marginBottom: '1rem', overflow: 'hidden' }}>
      <div style={{ background: '#f8f9fa', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #dee2e6' }}>
        <strong>Bestellung #{order.id.slice(0, 8)}...</strong>
        <span style={{ background: '#198754', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}>{order.status}</span>
      </div>
      <div style={{ padding: '1rem' }}>
        <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>📅 {new Date(order.orderDate).toLocaleDateString('de-DE')}</p>
        {order.items.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #f0f0f0' }}>
            <span>{item.productName} x{item.quantity}</span>
            <span>{(item.unitPrice * item.quantity).toFixed(2)} €</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem' }}>
          <strong>Gesamt: {order.totalPrice.toFixed(2)} €</strong>
          <button onClick={() => navigate('/orders/'+order.id)} style={{ background: 'transparent', border: '1px solid #0d6efd', color: '#0d6efd', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>Details →</button>
        </div>
      </div>
    </div>
  )
}
export default OrderCard
