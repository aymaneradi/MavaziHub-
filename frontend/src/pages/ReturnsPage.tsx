import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyReturns } from '../api/returnApi'
import { useAuth } from '../auth/AuthContext'
import type { ReturnRequestSummary } from '../types/ReturnRequest'

function ReturnsPage() {
  const { isAuthenticated, isInitializing } = useAuth()
  const [returns, setReturns] = useState<ReturnRequestSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCurrentRequest = true

    async function loadReturns() {
      if (!isAuthenticated) {
        setReturns([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const returnData = await getMyReturns()

        if (isCurrentRequest) {
          setReturns(returnData)
        }
      } catch {
        if (isCurrentRequest) {
          setError('Ruecksendungen konnten nicht geladen werden.')
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false)
        }
      }
    }

    loadReturns()

    return () => {
      isCurrentRequest = false
    }
  }, [isAuthenticated])

  return (
    <section className="page-section">
      <div className="page-heading">
        <p>Ruecksendungen</p>
        <h1>Meine Ruecksendungen</h1>
        <span>Hier werden Ruecksendeanfragen des eingeloggten Kunden ueber `/api/me/returns` geladen.</span>
      </div>

      {isInitializing && <p className="status-message">Sitzung wird geprueft...</p>}

      {!isInitializing && !isAuthenticated && (
        <div className="empty-panel">
          <h2>Bitte anmelden</h2>
          <p>Deine Ruecksendungen sind nur mit einem Kundenkonto sichtbar.</p>
          <Link className="primary-link-button" to="/login">
            Zum Login
          </Link>
        </div>
      )}

      {!isInitializing && isAuthenticated && isLoading && (
        <p className="status-message">Ruecksendungen werden geladen...</p>
      )}

      {!isInitializing && isAuthenticated && error && (
        <p className="status-message status-message-error">{error}</p>
      )}

      {!isInitializing && isAuthenticated && !isLoading && !error && returns.length === 0 && (
        <div className="empty-panel">
          <h2>Keine Ruecksendungen</h2>
          <p>Wenn du spaeter eine Ruecksendung erstellst, erscheint sie hier.</p>
          <Link className="primary-link-button" to="/orders">
            Bestellungen ansehen
          </Link>
        </div>
      )}

      {!isInitializing && isAuthenticated && !isLoading && !error && returns.length > 0 && (
        <div className="return-list">
          {returns.map((returnRequest) => (
            <Link className="return-card" key={returnRequest.id} to={`/returns/${returnRequest.id}`}>
              <div>
                <p className="eyebrow">{formatDate(returnRequest.createdAt)}</p>
                <h2>{returnRequest.returnNumber ?? `Ruecksendung ${returnRequest.id}`}</h2>
                <span>
                  Bestellung {returnRequest.orderNumber ?? returnRequest.orderId ?? 'unbekannt'}
                </span>
              </div>

              <div className="return-card-meta">
                <span>{returnRequest.status ?? 'Status offen'}</span>
                <strong>{returnRequest.itemCount ?? 0} Artikel</strong>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

function formatDate(dateValue?: string | null) {
  if (!dateValue) {
    return 'Datum offen'
  }

  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
  }).format(new Date(dateValue))
}

export default ReturnsPage
