import { useEffect, useState } from 'react'

import { adminApi } from '../../api'
import { useAuth } from '../../auth/AuthContext'
import type { ReturnRequestResponseDTO } from '../../types'

const returnStatuses = ['REQUESTED', 'APPROVED', 'REJECTED', 'RECEIVED', 'REFUNDED', 'COMPLETED']
const returnStatusLabels: Record<string, string> = {
  REQUESTED: 'Beantragt',
  APPROVED: 'Genehmigt',
  REJECTED: 'Abgelehnt',
  RECEIVED: 'Eingegangen',
  REFUNDED: 'Erstattet',
  COMPLETED: 'Abgeschlossen',
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  )

export function AdminReturnsPage() {
  const auth = useAuth()
  const [returns, setReturns] = useState<ReturnRequestResponseDTO[]>([])
  const [statusDrafts, setStatusDrafts] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const areaLabel = auth.hasAnyRole(['ROLE_ADMIN']) ? 'Adminbereich' : 'Mitarbeiterbereich'

  useEffect(() => {
    async function loadReturns() {
      try {
        const response = await adminApi.getReturns()
        setReturns(response)
        setStatusDrafts(Object.fromEntries(response.map((returnRequest) => [returnRequest.id, returnRequest.status])))
      } catch {
        setMessage('Retouren konnten nicht geladen werden.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadReturns()
  }, [])

  async function updateStatus(returnId: string) {
    setMessage('')

    try {
      const updated = await adminApi.updateReturnStatus(returnId, statusDrafts[returnId])
      setReturns((current) =>
        current.map((returnRequest) => (returnRequest.id === returnId ? updated : returnRequest)),
      )
    } catch {
      setMessage('Retourenstatus konnte nicht gespeichert werden.')
    }
  }

  return (
    <section className="admin-workspace">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">{areaLabel}</p>
          <h1>Retouren</h1>
          <p>Rücksendungen einsehen und den Bearbeitungsstand aktualisieren.</p>
        </div>
      </div>

      {message && <p className="admin-message" role="status">{message}</p>}

      <div className="admin-panel">
        {isLoading ? (
          <p className="admin-muted">Retouren werden geladen.</p>
        ) : returns.length === 0 ? (
          <p className="admin-muted">Noch keine Retouren vorhanden.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Retoure</th>
                  <th>Bestellung</th>
                  <th>Datum</th>
                  <th>Artikel</th>
                  <th>Status</th>
                  <th>Aktion</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((returnRequest) => (
                  <tr key={returnRequest.id}>
                    <td>
                      <strong>#{returnRequest.id.slice(0, 8)}</strong>
                      <small>{returnRequest.reason || 'Kein Grund angegeben'}</small>
                    </td>
                    <td>#{returnRequest.orderId.slice(0, 8)}</td>
                    <td>{formatDate(returnRequest.createdAt)}</td>
                    <td>{returnRequest.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                    <td>
                      <select
                        value={statusDrafts[returnRequest.id] ?? returnRequest.status}
                        onChange={(event) =>
                          setStatusDrafts((current) => ({
                            ...current,
                            [returnRequest.id]: event.target.value,
                          }))
                        }
                      >
                        {returnStatuses.map((status) => (
                          <option key={status} value={status}>
                            {returnStatusLabels[status]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button type="button" onClick={() => updateStatus(returnRequest.id)}>
                          Speichern
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
