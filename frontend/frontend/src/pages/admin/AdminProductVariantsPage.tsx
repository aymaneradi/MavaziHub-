import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'

import { adminApi } from '../../api'
import type { ProductDetailResponse, ProductVariantResponse } from '../../types'

const emptyVariantForm = {
  size: '',
  color: '',
  pattern: '',
  stockQuantity: '0',
}

export function AdminProductVariantsPage() {
  const { id } = useParams()
  const productId = Number(id)
  const [product, setProduct] = useState<ProductDetailResponse | null>(null)
  const [variants, setVariants] = useState<ProductVariantResponse[]>([])
  const [form, setForm] = useState(emptyVariantForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [stockDrafts, setStockDrafts] = useState<Record<number, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')

  async function loadData() {
    if (!Number.isFinite(productId)) {
      setMessage('Ungültige Produkt-ID.')
      setIsLoading(false)
      return
    }

    try {
      const [productResponse, variantsResponse] = await Promise.all([
        adminApi.getProduct(productId),
        adminApi.getVariants(productId),
      ])
      setProduct(productResponse)
      setVariants(variantsResponse)
      setStockDrafts(
        Object.fromEntries(variantsResponse.map((variant) => [variant.id, `${variant.stockQuantity}`])),
      )
    } catch {
      setMessage('Varianten konnten nicht geladen werden.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [productId])

  function startEdit(variant: ProductVariantResponse) {
    setEditingId(variant.id)
    setForm({
      size: variant.size ?? '',
      color: variant.color ?? '',
      pattern: variant.pattern ?? '',
      stockQuantity: `${variant.stockQuantity}`,
    })
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyVariantForm)
  }

  async function submitVariant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    try {
      const request = {
        size: form.size.trim() || undefined,
        color: form.color.trim() || undefined,
        pattern: form.pattern.trim() || undefined,
      }

      const saved = editingId
        ? await adminApi.updateVariant(productId, editingId, request)
        : await adminApi.createVariant(productId, {
            ...request,
            stockQuantity: Math.max(0, Number(form.stockQuantity)),
          })

      setVariants((current) =>
        editingId
          ? current.map((variant) => (variant.id === saved.id ? saved : variant))
          : [...current, saved],
      )
      setStockDrafts((current) => ({ ...current, [saved.id]: `${saved.stockQuantity}` }))
      resetForm()
    } catch {
      setMessage('Variante konnte nicht gespeichert werden.')
    }
  }

  async function updateStock(variantId: number) {
    setMessage('')

    try {
      const updated = await adminApi.updateVariantStock(productId, variantId, {
        stockQuantity: Math.max(0, Number(stockDrafts[variantId] ?? 0)),
      })
      setVariants((current) => current.map((variant) => (variant.id === variantId ? updated : variant)))
    } catch {
      setMessage('Lagerbestand konnte nicht aktualisiert werden.')
    }
  }

  async function toggleVariant(variant: ProductVariantResponse) {
    setMessage('')

    try {
      const updated = variant.active
        ? await adminApi.deactivateVariant(productId, variant.id)
        : await adminApi.activateVariant(productId, variant.id)
      setVariants((current) => current.map((item) => (item.id === variant.id ? updated : item)))
    } catch {
      setMessage('Variantenstatus konnte nicht geändert werden.')
    }
  }

  return (
    <section className="admin-workspace">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Produktvarianten</p>
          <h1>{product?.name ?? 'Varianten'}</h1>
          <p>Größe, Farbe, Muster und Lagerbestand verwalten.</p>
        </div>
        <Link className="admin-secondary-link" to="/admin/products">
          Zur Produktliste
        </Link>
      </div>

      {message && <p className="admin-message" role="status">{message}</p>}

      <div className="admin-grid-two">
        <form className="admin-panel admin-form" onSubmit={submitVariant}>
          <h2>{editingId ? 'Variante bearbeiten' : 'Variante anlegen'}</h2>
          <label>
            <span>Größe</span>
            <input
              value={form.size}
              onChange={(event) => setForm((current) => ({ ...current, size: event.target.value }))}
            />
          </label>
          <label>
            <span>Farbe</span>
            <input
              value={form.color}
              onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))}
            />
          </label>
          <label>
            <span>Muster</span>
            <input
              value={form.pattern}
              onChange={(event) =>
                setForm((current) => ({ ...current, pattern: event.target.value }))
              }
            />
          </label>
          {!editingId && (
            <label>
              <span>Anfangsbestand</span>
              <input
                min="0"
                type="number"
                value={form.stockQuantity}
                onChange={(event) =>
                  setForm((current) => ({ ...current, stockQuantity: event.target.value }))
                }
              />
            </label>
          )}
          <div className="admin-form-actions admin-wide">
            <button type="submit">{editingId ? 'Aktualisieren' : 'Anlegen'}</button>
            {editingId && (
              <button className="admin-light-button" type="button" onClick={resetForm}>
                Abbrechen
              </button>
            )}
          </div>
        </form>

        <div className="admin-panel">
          {isLoading ? (
            <p className="admin-muted">Varianten werden geladen.</p>
          ) : variants.length === 0 ? (
            <p className="admin-muted">Noch keine Varianten vorhanden.</p>
          ) : (
            <div className="admin-list">
              {variants.map((variant) => (
                <article className="admin-list-row" key={variant.id}>
                  <div>
                    <strong>{variant.variantLabel || `Variante #${variant.id}`}</strong>
                    <small>{variant.active ? 'Aktiv' : 'Deaktiviert'}</small>
                  </div>
                  <label>
                    <span>Bestand</span>
                    <input
                      min="0"
                      type="number"
                      value={stockDrafts[variant.id] ?? variant.stockQuantity}
                      onChange={(event) =>
                        setStockDrafts((current) => ({
                          ...current,
                          [variant.id]: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <div className="admin-actions">
                    <button type="button" onClick={() => updateStock(variant.id)}>
                      Bestand speichern
                    </button>
                    <button type="button" onClick={() => startEdit(variant)}>
                      Bearbeiten
                    </button>
                    <button type="button" onClick={() => toggleVariant(variant)}>
                      {variant.active ? 'Deaktivieren' : 'Aktivieren'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
