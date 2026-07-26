import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { adminApi } from '../../api'
import type { CategoryResponse } from '../../types'

const emptyCategory = { name: '', description: '' }

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [form, setForm] = useState(emptyCategory)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<'error' | 'success'>('error')

  async function loadCategories() {
    try {
      const response = await adminApi.getCategories()
      setCategories(response)
    } catch {
      setMessageTone('error')
      setMessage('Kategorien konnten nicht geladen werden.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadCategories()
  }, [])

  function startEdit(category: CategoryResponse) {
    setEditingId(category.id)
    setForm({
      name: category.name,
      description: category.description ?? '',
    })
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyCategory)
  }

  async function submitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    try {
      const request = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      }
      const saved = editingId
        ? await adminApi.updateCategory(editingId, request)
        : await adminApi.createCategory(request)

      setCategories((current) =>
        editingId
          ? current.map((category) => (category.id === saved.id ? saved : category))
          : [...current, saved].sort((a, b) => a.name.localeCompare(b.name)),
      )
      setMessageTone('success')
      setMessage(editingId ? 'Kategorie wurde aktualisiert.' : 'Kategorie wurde angelegt.')
      resetForm()
    } catch {
      setMessageTone('error')
      setMessage('Kategorie konnte nicht gespeichert werden.')
    }
  }

  return (
    <section className="admin-workspace">
      <div className="admin-page-header">
        <div>
          <p className="eyebrow">Katalog</p>
          <h1>Kategorien</h1>
          <p>Kategorien für den Shop anlegen und bearbeiten.</p>
        </div>
      </div>

      {message && <p className={`admin-message ${messageTone}`} role="status">{message}</p>}

      <p className="admin-system-note">
        Kategorien können angelegt und bei Bedarf angepasst werden.
      </p>

      <div className="admin-grid-two">
        <form className="admin-panel admin-form" onSubmit={submitCategory}>
          <h2>{editingId ? 'Kategorie bearbeiten' : 'Kategorie anlegen'}</h2>
          <label className="admin-wide">
            <span>Name</span>
            <input
              required
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </label>
          <label className="admin-wide">
            <span>Beschreibung optional</span>
            <textarea
              rows={4}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </label>
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
            <p className="admin-muted">Kategorien werden geladen.</p>
          ) : categories.length === 0 ? (
            <p className="admin-muted">Noch keine Kategorien vorhanden.</p>
          ) : (
            <div className="admin-list">
              {categories.map((category) => (
                <article className="admin-list-row" key={category.id}>
                  <div>
                    <strong>{category.name}</strong>
                    <small>{category.description || 'Keine Beschreibung'}</small>
                  </div>
                  <div className="admin-actions">
                    <button type="button" onClick={() => startEdit(category)}>
                      Bearbeiten
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
