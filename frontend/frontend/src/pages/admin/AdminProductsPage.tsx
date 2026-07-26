import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { adminApi } from '../../api'
import { useAuth } from '../../auth/AuthContext'
import type { ProductResponse } from '../../types'

type LocationState = {
  message?: string
}

const formatCurrency = (value: number) =>
  value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })

export function AdminProductsPage() {
  const auth = useAuth()
  const location = useLocation()
  const locationState = location.state as LocationState | null
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState(locationState?.message ?? '')
  const [messageTone, setMessageTone] = useState<'error' | 'success'>(
    locationState?.message ? 'success' : 'error',
  )
  const areaLabel = auth.hasAnyRole(['ROLE_ADMIN']) ? 'Adminbereich' : 'Mitarbeiterbereich'

  async function loadProducts() {
    setIsLoading(true)

    try {
      const response = await adminApi.getProducts()
      setProducts(response)
    } catch {
      setMessageTone('error')
      setMessage('Produkte konnten nicht geladen werden.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadProducts()
  }, [])

  async function toggleProduct(product: ProductResponse) {
    setMessage('')

    try {
      const updated = product.active
        ? await adminApi.deactivateProduct(product.id)
        : await adminApi.publishProduct(product.id)

      setProducts((current) => current.map((item) => (item.id === product.id ? updated : item)))
      setMessageTone('success')
      setMessage(updated.active ? 'Produkt wurde veröffentlicht.' : 'Produkt wurde deaktiviert.')
    } catch {
      setMessageTone('error')
      setMessage('Produktstatus konnte nicht geändert werden.')
    }
  }

  return (
    <section className="admin-workspace">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">{areaLabel}</p>
          <h1>Produkte</h1>
          <p>Produkte bearbeiten, veröffentlichen und Lagerdetails prüfen.</p>
        </div>
        <Link className="admin-primary-link" to="/admin/products/new">
          Produkt anlegen
        </Link>
      </div>

      {message && <p className={`admin-message ${messageTone}`} role="status">{message}</p>}

      <p className="admin-system-note">
        Bilder werden aktuell über Bildadressen gepflegt. Produkte können bei Bedarf deaktiviert werden.
      </p>

      <div className="admin-panel">
        {isLoading ? (
          <p className="admin-muted">Produkte werden geladen.</p>
        ) : products.length === 0 ? (
          <p className="admin-muted">Noch keine Produkte vorhanden.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Produkt</th>
                  <th>Kategorie</th>
                  <th>Preis</th>
                  <th>Lager</th>
                  <th>Status</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                      <small>#{product.id}</small>
                    </td>
                    <td>{product.categoryName}</td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>{product.stockQuantity}</td>
                    <td>
                      <span className={product.active ? 'admin-badge success' : 'admin-badge'}>
                        {product.active ? 'Veröffentlicht' : 'Deaktiviert'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <Link to={`/admin/products/${product.id}/edit`}>Bearbeiten</Link>
                        <Link to={`/admin/products/${product.id}/variants`}>Varianten</Link>
                        <button type="button" onClick={() => toggleProduct(product)}>
                          {product.active ? 'Deaktivieren' : 'Veröffentlichen'}
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
