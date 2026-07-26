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
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<'error' | 'success'>('error')

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
        setMessageTone('error')
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
        setMessageTone('error')
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

      navigate('/admin/products', {
        state: { message: isEditMode ? 'Produkt wurde aktualisiert.' : 'Produkt wurde angelegt.' },
      })
    } catch {
      setMessageTone('error')
      setMessage('Produkt konnte nicht gespeichert werden.')
    } finally {
      setIsSaving(false)
    }
  }

  function appendImageUrls(uploadedUrls: string[]) {
    setForm((current) => {
      const existingAdditionalUrls = splitImageUrls(current.imageUrls)
      const nextAdditionalUrls = [...existingAdditionalUrls]
      let nextPrimaryUrl = current.imageUrl.trim()

      uploadedUrls.forEach((imageUrl) => {
        if (!nextPrimaryUrl) {
          nextPrimaryUrl = imageUrl
          return
        }

        if (nextPrimaryUrl !== imageUrl && !nextAdditionalUrls.includes(imageUrl)) {
          nextAdditionalUrls.push(imageUrl)
        }
      })

      return {
        ...current,
        imageUrl: nextPrimaryUrl,
        imageUrls: nextAdditionalUrls.join('\n'),
      }
    })
  }

  async function uploadImages(files: FileList | null) {
    if (!files || files.length === 0) {
      return
    }

    setIsUploadingImages(true)
    setMessage('')

    try {
      const uploadedImages = await Promise.all(
        Array.from(files).map((file) => adminApi.uploadProductImage(file)),
      )
      appendImageUrls(uploadedImages.map((image) => image.imageUrl))
      setMessageTone('success')
      setMessage(
        uploadedImages.length === 1
          ? 'Bild wurde hochgeladen.'
          : `${uploadedImages.length} Bilder wurden hochgeladen.`,
      )
    } catch {
      setMessageTone('error')
      setMessage('Bild konnte nicht hochgeladen werden. Bitte nutze JPG, PNG, WebP oder GIF.')
    } finally {
      setIsUploadingImages(false)
    }
  }

  return (
    <section className="admin-workspace">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Produktverwaltung</p>
          <h1>{isEditMode ? 'Produkt bearbeiten' : 'Produkt anlegen'}</h1>
          <p>Produktdaten, Preis, Kategorie und Lagerbestand bearbeiten.</p>
        </div>
        <Link className="admin-secondary-link" to="/admin/products">
          Zur Produktliste
        </Link>
      </div>

      {message && <p className={`admin-message ${messageTone}`} role="status">{message}</p>}

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
              <span>Bilder vom Computer hochladen</span>
              <input
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                type="file"
                onChange={(event) => {
                  void uploadImages(event.target.files)
                  event.target.value = ''
                }}
              />
              <small className="field-help">
                Die hochgeladenen Bilder werden automatisch als Bildadressen übernommen.
              </small>
            </label>

            <label className="admin-wide">
              <span>Hauptbild-Adresse optional</span>
              <input
                value={form.imageUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, imageUrl: event.target.value }))
                }
              />
            </label>

            <label className="admin-wide">
              <span>Weitere Bildadressen optional</span>
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
              <button disabled={!canSave || isSaving || isUploadingImages} type="submit">
                {isSaving ? 'Speichern läuft' : isUploadingImages ? 'Bilder werden hochgeladen' : 'Speichern'}
              </button>
              <Link to="/admin/products">Abbrechen</Link>
            </div>
          </>
        )}
      </form>
    </section>
  )
}
