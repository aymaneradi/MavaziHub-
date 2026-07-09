import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { returnApi } from '../../api'
import type { ReturnRequestResponseDTO } from '../../types'

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

const returnStatusLabel = (status: string) =>
  ({
    REQUESTED: 'Beantragt',
    APPROVED: 'Genehmigt',
    REJECTED: 'Abgelehnt',
    RECEIVED: 'Eingegangen',
    REFUNDED: 'Erstattet',
  })[status] ?? status

export function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequestResponseDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadReturns() {
      try {
        const response = await returnApi.getMyReturns()
        setReturns(response)
      } catch {
        setMessage('Deine Rücksendungen konnten gerade nicht geladen werden.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadReturns()
  }, [])

  return (
    <section className="account-page">
      <div className="commerce-header">
        <div>
          <p className="eyebrow">Rücksendungen</p>
          <h1>Meine Rücksendungen</h1>
          <p>Hier findest du den aktuellen Stand deiner Rücksendungen.</p>
        </div>
        <Link to="/returns/new">Rücksendung anfordern</Link>
      </div>

      {message && <p className="commerce-message" role="status">{message}</p>}

      {isLoading ? (
        <div className="commerce-empty">
          <h2>Rücksendungen werden geladen</h2>
        </div>
      ) : returns.length === 0 ? (
        <div className="commerce-empty">
          <h2>Noch keine Rücksendungen</h2>
          <p>Starte eine Rücksendung direkt aus deiner Bestellung.</p>
          <Link to="/returns/new">Rücksendung starten</Link>
        </div>
      ) : (
        <div className="account-list">
          {returns.map((returnRequest) => (
            <article className="account-card" key={returnRequest.id}>
              <div>
                <span className="status-pill">{returnStatusLabel(returnRequest.status)}</span>
                <h2>Rücksendung #{returnRequest.id.slice(0, 8)}</h2>
                <p>
                  Bestellung #{returnRequest.orderId.slice(0, 8)} ·{' '}
                  {formatDate(returnRequest.createdAt)}
                </p>
                {returnRequest.reason && <p>{returnRequest.reason}</p>}
              </div>
              <div className="account-card-meta">
                <strong>
                  {returnRequest.items.reduce((sum, item) => sum + item.quantity, 0)} Artikel
                </strong>
                <Link to={`/orders/${returnRequest.orderId}`}>Bestellung ansehen</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
