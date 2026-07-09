import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { adminApi } from '../../api'
import type { CategoryResponse, CreateProductRequest } from '../../types'

const emptyForm = {
  name: '',
  description: '',
  price: '0',
  imageUrl: '',
  imageUrls: '',
  stockQuantity: '0',
  categoryId: '',
}

function splitImageUrls(value: string) {
  return value
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean)
}

export function AdminProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const productId = id ? Number(id) : undefined
  const isEditMode = Number.isFinite(productId)
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [form, setForm] = useState(emptyForm)
  const [isLoading, setIsLoading] = useState(Boolean(isEditMode))
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await adminApi.getCategories()
        setCategories(response)
        setForm((current) => ({
          ...current,
          categoryId: current.categoryId || response[0]?.id.toString() || '',
        }))
      } catch {
        setMessage('Kategorien konnten nicht geladen werden.')
      }
    }

    void loadCategories()
  }, [])

  useEffect(() => {
    async function loadProduct(currentProductId: number) {
      try {
        const product = await adminApi.getProduct(currentProductId)
        setForm({
          name: product.name,
          description: product.description ?? '',
          price: product.price.toString(),
          imageUrl: product.imageUrl ?? product.imageUrls?.[0] ?? '',
          imageUrls: product.imageUrls
            ?.filter((imageUrl) => imageUrl !== (product.imageUrl ?? product.imageUrls?.[0]))
            .join('\n') ?? '',
          stockQuantity: product.stockQuantity.toString(),
          categoryId: product.categoryId.toString(),
        })
      } catch {
        setMessage('Produkt konnte nicht geladen werden.')
      } finally {
        setIsLoading(false)
      }
    }

    if (isEditMode && productId) {
      void loadProduct(productId)
    }
  }, [isEditMode, productId])

  const canSave = useMemo(
    () => form.name.trim() && form.categoryId && Number(form.price) > 0,
    [form.categoryId, form.name, form.price],
  )

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setMessage('')

    const request: CreateProductRequest = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: Number(form.price),
      imageUrl: form.imageUrl.trim() || undefined,
      imageUrls: splitImageUrls(form.imageUrls),
      stockQuantity: Math.max(0, Number(form.stockQuantity)),
      categoryId: Number(form.categoryId),
    }

    try {
      if (isEditMode && productId) {
        await adminApi.updateProduct(productId, request)
      } else {
        await adminApi.createProduct(request)
      }

      navigate('/admin/products')
    } catch {
      setMessage('Produkt konnte nicht gespeichert werden.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="admin-workspace">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Produktverwaltung</p>
          <h1>{isEditMode ? 'Produkt bearbeiten' : 'Produkt anlegen'}</h1>
          <p>Basisdaten, Preis, Kategorie und Hauptlagerbestand verwalten.</p>
        </div>
        <Link className="admin-secondary-link" to="/admin/products">
          Zur Produktliste
        </Link>
      </div>

      {message && <p className="admin-message" role="status">{message}</p>}

      <form className="admin-panel admin-form" onSubmit={submitProduct}>
        {isLoading ? (
          <p className="admin-muted">Produkt wird geladen.</p>
        ) : (
          <>
            <label className="admin-wide">
              <span>Name</span>
              <input
                required
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>

            <label>
              <span>Preis</span>
              <input
                min="0.01"
                step="0.01"
                type="number"
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
              />
            </label>

            <label>
              <span>Lagerbestand</span>
              <input
                min="0"
                type="number"
                value={form.stockQuantity}
                onChange={(event) =>
                  setForm((current) => ({ ...current, stockQuantity: event.target.value }))
                }
              />
            </label>

            <label>
              <span>Kategorie</span>
              <select
                required
                value={form.categoryId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, categoryId: event.target.value }))
                }
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-wide">
              <span>Hauptbild-URL optional</span>
              <input
                value={form.imageUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, imageUrl: event.target.value }))
                }
              />
            </label>

            <label className="admin-wide">
              <span>Weitere Bild-URLs optional</span>
              <textarea
                rows={4}
                value={form.imageUrls}
                onChange={(event) =>
                  setForm((current) => ({ ...current, imageUrls: event.target.value }))
                }
              />
            </label>

            <label className="admin-wide">
              <span>Beschreibung optional</span>
              <textarea
                rows={5}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </label>

            <div className="admin-form-actions admin-wide">
              <button disabled={!canSave || isSaving} type="submit">
                {isSaving ? 'Speichern läuft' : 'Speichern'}
              </button>
              <Link to="/admin/products">Abbrechen</Link>
            </div>
          </>
        )}
      </form>
    </section>
  )
}
