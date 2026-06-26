import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProductById, getProductVariants } from '../../api/productApi'
import ErrorMessage from '../../components/common/ErrorMessage'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import VariantSelector from '../../components/product/VariantSelector'
import type { ProductDetail, ProductVariant } from '../../types/Product'

const priceFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
})

function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)

  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedVariantId) ?? null,
    [variants, selectedVariantId],
  )

  useEffect(() => {
    async function loadProductDetails() {
      if (!id) {
        setErrorMessage('Es wurde keine Produkt-ID übergeben.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setErrorMessage(null)

        const [loadedProduct, loadedVariants] = await Promise.all([
          getProductById(id),
          getProductVariants(id),
        ])

        setProduct(loadedProduct)
        setVariants(loadedVariants)

        const firstAvailableVariant = loadedVariants.find(
          (variant) => variant.active !== false && variant.stockQuantity > 0,
        )

        setSelectedVariantId(firstAvailableVariant?.id ?? null)
      } catch {
        setErrorMessage('Das Produkt konnte nicht geladen werden.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProductDetails()
  }, [id])

  function handleQuantityChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextQuantity = Number(event.target.value)

    if (nextQuantity < 1) {
      setQuantity(1)
      return
    }

    setQuantity(nextQuantity)
  }

  function handleAddToCartPreview() {
    if (!selectedVariant) {
      setInfoMessage('Bitte zuerst eine verfügbare Variante auswählen.')
      return
    }

    setInfoMessage(
      `Phase 3: Dieses Produkt wird später mit Variante ${selectedVariant.id} und Menge ${quantity} in den Warenkorb gelegt.`,
    )
  }

  if (isLoading) {
    return (
      <section className="mh-page">
        <LoadingSpinner text="Produktdetails werden geladen ..." />
      </section>
    )
  }

  if (errorMessage || !product) {
    return (
      <section className="mh-page">
        <ErrorMessage
          title="Produkt nicht verfügbar"
          message={errorMessage ?? 'Das Produkt wurde nicht gefunden.'}
        />
        <Link to="/products" className="mh-button-secondary">
          Zurück zur Produktübersicht
        </Link>
      </section>
    )
  }

  const imageUrl = product.imageUrl || '/placeholder-product.svg'
  const isAddToCartDisabled = !selectedVariant || selectedVariant.stockQuantity <= 0

  return (
    <section className="mh-page">
      <Link to="/products" className="mh-product-back-link">
        ← Zurück zur Produktübersicht
      </Link>

      <div className="mh-product-detail">
        <div className="mh-product-detail-image-wrapper">
          <img
            className="mh-product-detail-image"
            src={imageUrl}
            alt={product.name}
          />
        </div>

        <div className="mh-product-detail-info">
          {product.categoryName && (
            <span className="mh-badge">{product.categoryName}</span>
          )}

          <h1 className="mh-section-title">{product.name}</h1>

          <strong className="mh-product-detail-price">
            {priceFormatter.format(product.price)}
          </strong>

          <div className="mh-product-detail-block">
            <h2>Variante auswählen</h2>
            <VariantSelector
              variants={variants}
              selectedVariantId={selectedVariantId}
              onVariantChange={setSelectedVariantId}
            />
          </div>

          <div className="mh-product-detail-block">
            <label className="mh-quantity-field">
              <span>Menge</span>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
              />
            </label>
          </div>

          <button
            type="button"
            className="mh-button-primary"
            onClick={handleAddToCartPreview}
            disabled={isAddToCartDisabled}
          >
            In den Warenkorb
          </button>

          {infoMessage && <p className="mh-info-message">{infoMessage}</p>}
        </div>
      </div>

      <div className="mh-product-description mh-card">
        <h2>Beschreibung</h2>
        <p>
          {product.description ||
            'Für dieses Produkt ist aktuell keine Beschreibung vorhanden.'}
        </p>
      </div>
    </section>
  )
}

export default ProductDetailPage