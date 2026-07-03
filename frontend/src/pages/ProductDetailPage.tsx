import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProductById } from '../api/productApi'
import type { ProductDetail } from '../types/Product'

const productPalettes = ['sunset', 'gold', 'indigo', 'leaf'] as const

function ProductDetailPage() {
  const { productId } = useParams()
  const numericProductId = Number(productId)
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const palette = useMemo(() => {
    if (!Number.isFinite(numericProductId)) {
      return productPalettes[0]
    }

    return productPalettes[numericProductId % productPalettes.length]
  }, [numericProductId])

  useEffect(() => {
    let isCurrentRequest = true

    async function loadProduct() {
      if (!Number.isFinite(numericProductId)) {
        setError('Dieses Produkt ist nicht gueltig.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const productData = await getProductById(numericProductId)

        if (isCurrentRequest) {
          setProduct(productData)
        }
      } catch {
        if (isCurrentRequest) {
          setError('Produktdetails konnten nicht geladen werden.')
        }
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false)
        }
      }
    }

    loadProduct()

    // Wenn der Nutzer schnell die Seite wechselt, ignorieren wir spaete API-Antworten.
    return () => {
      isCurrentRequest = false
    }
  }, [numericProductId])

  if (isLoading) {
    return (
      <section className="page-section">
        <p className="status-message">Produktdetails werden geladen...</p>
      </section>
    )
  }

  if (error || !product) {
    return (
      <section className="page-section">
        <p className="status-message status-message-error">
          {error ?? 'Dieses Produkt wurde nicht gefunden.'}
        </p>
        <Link className="secondary-link" to="/products">
          Zurueck zu den Produkten
        </Link>
      </section>
    )
  }

  return (
    <section className="page-section">
      <Link className="secondary-link" to="/products">
        Zurueck zu den Produkten
      </Link>

      <div className="product-detail">
        <div className={`product-detail-media product-image-${palette}`}>
          {product.imageUrl && <img src={product.imageUrl} alt="" className="product-detail-photo" />}
        </div>

        <div className="product-detail-info">
          <p className="eyebrow">{product.categoryName}</p>
          <h1>{product.name}</h1>
          <strong>{formatPrice(product.price)}</strong>
          <p>
            {product.description ??
              'Zu diesem Produkt gibt es noch keine Beschreibung. Die Detailseite ist aber bereits fuer echte Backend-Daten vorbereitet.'}
          </p>

          <dl className="product-meta">
            <div>
              <dt>Status</dt>
              <dd>{product.active ? 'Aktiv' : 'Nicht aktiv'}</dd>
            </div>
            <div>
              <dt>Lagerbestand</dt>
              <dd>{product.stockQuantity} Stueck</dd>
            </div>
          </dl>

          <div className="product-detail-actions">
            <button className="primary-button" type="button" disabled={product.stockQuantity === 0}>
              In den Warenkorb
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

export default ProductDetailPage
