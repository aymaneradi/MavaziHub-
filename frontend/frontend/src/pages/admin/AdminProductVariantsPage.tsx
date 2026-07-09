import { FormEvent, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { adminApi } from '../../api'
import type { ProductDetailResponse, ProductVariantResponse } from '../../types'

type VariantFormState = {
  size: string
  color: string
  pattern: string
  stockQuantity: number
}

const emptyForm: VariantFormState = {
  size: '',
  color: '',
  pattern: '',
  stockQuantity: 0,
}

function toOptionalText(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export function AdminProductVariantsPage() {
  const { id } = useParams()
  const productId = Number(id)

  const [product, setProduct] = useState<ProductDetailResponse | null>(null)
  const [variants, setVariants] = useState<ProductVariantResponse[]>([])
  const [stockInputs, setStockInputs] = useState<Record<number, number>>({})
  const [form, setForm] = useState<VariantFormState>(emptyForm)
  const [editingVariantId, setEditingVariantId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function loadData() {
    if (!Number.isFinite(productId)) {
      setMessage('Ungültige Produkt-ID.')
      setIsLoading(false)
      return
    }

    try {
      const [productData, variantsData] = await Promise.all([
        adminApi.getProduct(productId),
        adminApi.getVariants(productId),
      ])
      setProduct(productData)
      setVariants(variantsData)
      setStockInputs(
        Object.fromEntries(
          variantsData.map((variant) => [variant.id, variant.stockQuantity]),
        ),
      )
    } catch {
      setMessage('Fehler beim Laden des Produkts.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [productId])

  function resetForm() {
    setForm(emptyForm)
    setEditingVariantId(null)
  }

  function editVariant(variant: ProductVariantResponse) {
    setEditingVariantId(variant.id)
    setForm({
      size: variant.size ?? '',
      color: variant.color ?? '',
      pattern: variant.pattern ?? '',
      stockQuantity: variant.stockQuantity,
    })
  }

  async function submitVariant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    const request = {
      size: toOptionalText(form.size),
      color: toOptionalText(form.color),
      pattern: toOptionalText(form.pattern),
    }

    if (!request.size && !request.color && !request.pattern) {
      setMessage('Bitte mindestens Größe, Farbe oder Muster angeben.')
      return
    }

    if (!Number.isFinite(form.stockQuantity) || form.stockQuantity < 0) {
      setMessage('Der Bestand darf nicht negativ sein.')
      return
    }

    setIsSaving(true)

    try {
      if (editingVariantId) {
        await adminApi.updateVariant(productId, editingVariantId, request)
        await adminApi.updateVariantStock(productId, editingVariantId, {
          stockQuantity: form.stockQuantity,
        })
        setMessage('Variante wurde aktualisiert.')
      } else {
        await adminApi.createVariant(productId, {
          ...request,
          stockQuantity: form.stockQuantity,
        })
        setMessage('Variante wurde angelegt.')
      }

      resetForm()
      await loadData()
    } catch {
      setMessage('Variante konnte nicht gespeichert werden.')
    } finally {
      setIsSaving(false)
    }
  }

  async function saveStock(variantId: number) {
    const stockQuantity = stockInputs[variantId]

    if (!Number.isFinite(stockQuantity) || stockQuantity < 0) {
      setMessage('Der Bestand darf nicht negativ sein.')
      return
    }

    try {
      await adminApi.updateVariantStock(productId, variantId, { stockQuantity })
      setMessage('Bestand wurde gespeichert.')
      await loadData()
    } catch {
      setMessage('Fehler beim Speichern des Lagerbestands.')
    }
  }

  async function toggleVariant(variant: ProductVariantResponse) {
    try {
      if (variant.active) {
        await adminApi.deactivateVariant(productId, variant.id)
        setMessage('Variante wurde deaktiviert.')
      } else {
        await adminApi.activateVariant(productId, variant.id)
        setMessage('Variante wurde aktiviert.')
      }

      await loadData()
    } catch {
      setMessage('Status der Variante konnte nicht geändert werden.')
    }
  }

  if (isLoading) {
    return <p className="admin-muted p-4">Laden...</p>
  }

  return (
    <section className="admin-workspace">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Lagerverwaltung</p>
          <h1>Varianten für {product?.name}</h1>
          <p>Bestände pro Größe und Farbe pflegen.</p>
        </div>
        <Link className="admin-secondary-link" to="/admin/products">
          Zurück
        </Link>
      </div>

      {message && <p className="admin-message" role="status">{message}</p>}

      <form className="admin-panel admin-form" onSubmit={submitVariant}>
        <label>
          <span>Größe</span>
          <input
            maxLength={50}
            type="text"
            value={form.size}
            onChange={(event) => setForm((current) => ({ ...current, size: event.target.value }))}
          />
        </label>
        <label>
          <span>Farbe</span>
          <input
            maxLength={80}
            type="text"
            value={form.color}
            onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))}
          />
        </label>
        <label>
          <span>Muster</span>
          <input
            maxLength={100}
            type="text"
            value={form.pattern}
            onChange={(event) => setForm((current) => ({ ...current, pattern: event.target.value }))}
          />
        </label>
        <label>
          <span>Bestand</span>
          <input
            min={0}
            type="number"
            value={form.stockQuantity}
            onChange={(event) =>
              setForm((current) => ({ ...current, stockQuantity: Number(event.target.value) }))
            }
          />
        </label>
        <div className="admin-form-actions admin-wide">
          <button type="submit" disabled={isSaving}>
            {editingVariantId ? 'Variante speichern' : 'Variante anlegen'}
          </button>
          {editingVariantId && (
            <button className="admin-light-button" type="button" onClick={resetForm}>
              Abbrechen
            </button>
          )}
        </div>
      </form>

      <div className="admin-panel">
        {variants.length === 0 ? (
          <p className="admin-muted">Noch keine Varianten vorhanden.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Bezeichnung</th>
                  <th>Größe</th>
                  <th>Farbe</th>
                  <th>Muster</th>
                  <th>Bestand</th>
                  <th>Status</th>
                  <th>Aktion</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => (
                  <tr key={variant.id}>
                    <td><strong>{variant.variantLabel}</strong></td>
                    <td>{variant.size || '-'}</td>
                    <td>{variant.color || '-'}</td>
                    <td>{variant.pattern || '-'}</td>
                    <td>
                      <input
                        min={0}
                        style={{ width: '90px' }}
                        type="number"
                        value={stockInputs[variant.id] ?? variant.stockQuantity}
                        onChange={(event) =>
                          setStockInputs((current) => ({
                            ...current,
                            [variant.id]: Number(event.target.value),
                          }))
                        }
                      />
                    </td>
                    <td>{variant.active ? 'Aktiv' : 'Inaktiv'}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-light-button"
                        onClick={() => saveStock(variant.id)}
                      >
                        Bestand speichern
                      </button>
                      <button
                        type="button"
                        className="admin-light-button"
                        onClick={() => editVariant(variant)}
                      >
                        Bearbeiten
                      </button>
                      <button
                        type="button"
                        className="admin-light-button"
                        onClick={() => toggleVariant(variant)}
                      >
                        {variant.active ? 'Deaktivieren' : 'Aktivieren'}
                      </button>
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
