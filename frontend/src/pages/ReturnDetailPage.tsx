import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getReturnById } from '../api/returnApi'
import { useAuth } from '../auth/AuthContext'
import type { ReturnRequestDetail } from '../types/ReturnRequest'

function ReturnDetailPage() {
  const { returnId } = useParams()
  const { isAuthenticated, isInitializing } = useAuth()
  const [returnRequest, setReturnRequest] = useState<ReturnRequestDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCurrentRequest = true

    async function loadReturn() {
      if (!isAuthenticated || !returnId) {
        setReturnRequest(null)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const returnData = await getReturnById(returnId)

        if (isCurrentRequest) {
          setReturnRequest(returnData)
        }
      } catch {
        if (isCurrentRequest) {
          setError('Ruecksendedetails konnten nicht geladen werden.')
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false)
        }
      }
    }

    loadReturn()

    return () => {
      isCurrentRequest = false
    }
  }, [isAuthenticated, returnId])

  return (
    <section className="page-section">
      <Link className="secondary-link" to="/returns">
        Zurueck zu den Ruecksendungen
      </Link>

      <div className="page-heading">
        <p>Ruecksendedetails</p>
        <h1>{returnRequest?.returnNumber ?? 'Ruecksendung'}</h1>
        <span>Hier wird der Status einer einzelnen Ruecksendeanfrage angezeigt.</span>
      </div>

      {isInitializing && <p className="status-message">Sitzung wird geprueft...</p>}

      {!isInitializing && !isAuthenticated && (
        <div className="empty-panel">
          <h2>Bitte anmelden</h2>
          <p>Ruecksendedetails sind nur mit einem Kundenkonto sichtbar.</p>
          <Link className="primary-link-button" to="/login">
            Zum Login
          </Link>
        </div>
      )}

      {!isInitializing && isAuthenticated && isLoading && (
        <p className="status-message">Ruecksendedetails werden geladen...</p>
      )}

      {!isInitializing && isAuthenticated && error && (
        <p className="status-message status-message-error">{error}</p>
      )}

      {!isInitializing && isAuthenticated && !isLoading && !error && returnRequest && (
        <div className="return-detail-panel">
          <dl className="detail-list">
            <div>
              <dt>Status</dt>
              <dd>{returnRequest.status ?? 'Status offen'}</dd>
            </div>
            <div>
              <dt>Bestellung</dt>
              <dd>{returnRequest.orderNumber ?? returnRequest.orderId ?? 'unbekannt'}</dd>
            </div>
            <div>
              <dt>Datum</dt>
              <dd>{formatDate(returnRequest.createdAt)}</dd>
            </div>
            <div>
              <dt>Artikel</dt>
              <dd>{returnRequest.itemCount ?? returnRequest.items?.length ?? 0}</dd>
            </div>
          </dl>

          {returnRequest.reason && <p>{returnRequest.reason}</p>}

          {returnRequest.items && returnRequest.items.length > 0 && (
            <div className="return-detail-items">
              <h2>Zurueckgesendete Artikel</h2>
              {returnRequest.items.map((item) => (
                <article className="return-detail-item" key={item.id ?? item.orderItemId}>
                  <div>
                    <h3>{`Artikel ${item.orderItemId}`}</h3>
                  </div>
                  <strong>{item.quantity} Stueck</strong>
                </article>
              ))}
            </div>
          )}
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

export default ReturnDetailPage
