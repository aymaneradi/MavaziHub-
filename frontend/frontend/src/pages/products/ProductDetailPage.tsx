import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { cartApi, productApi } from '../../api'
import { ProductVisual } from '../../components/product/ProductVisual'
import { mockProducts, mockVariants, toProductDetail, type StoreProduct } from '../../data/mockStore'
import type { ProductDetailResponse, ProductVariantResponse } from '../../types'

type DetailState = {
  product: ProductDetailResponse
  mockProduct?: StoreProduct
  variants: ProductVariantResponse[]
  isFallback: boolean
}

export function ProductDetailPage() {
  const { id } = useParams()
  const productId = Number(id)
  const [detail, setDetail] = useState<DetailState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariantId, setSelectedVariantId] = useState<number | undefined>()
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [cartMessage, setCartMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadProduct() {
      setIsLoading(true)

      try {
        const [product, variants] = await Promise.all([
          productApi.getProduct(productId),
          productApi.getVariants(productId).catch(() => []),
        ])

        if (isMounted) {
          setDetail({ product, variants, isFallback: false })
          setSelectedImageUrl(product.imageUrls?.[0] ?? product.imageUrl ?? null)
        }
      } catch {
        const mockProduct = mockProducts.find((product) => product.id === productId)
        const mockProductDetail = mockProduct ? toProductDetail(mockProduct) : null

        if (isMounted) {
          setDetail(
            mockProduct && mockProductDetail
              ? {
                  product: mockProductDetail,
                  mockProduct,
                  variants: mockVariants.filter((variant) => variant.productId === mockProduct.id),
                  isFallback: true,
                }
              : null,
          )
          setSelectedImageUrl(mockProductDetail?.imageUrls?.[0] ?? mockProductDetail?.imageUrl ?? null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    if (Number.isFinite(productId)) {
      void loadProduct()
    } else {
      setIsLoading(false)
      setDetail(null)
    }

    return () => {
      isMounted = false
    }
  }, [productId])

  const selectedVariant = useMemo(
    () => detail?.variants.find((variant) => variant.id === selectedVariantId),
    [detail?.variants, selectedVariantId],
  )

  async function handleAddToCart() {
    if (!detail) {
      return
    }

    if (detail.variants.length > 0 && !selectedVariantId) {
      setCartMessage('Bitte zuerst eine Variante auswählen.')
      return
    }

    if (!Number.isFinite(quantity) || quantity < 1) {
      setCartMessage('Bitte eine gültige Menge eingeben.')
      return
    }

    try {
      await cartApi.addItem({
        productId: detail.product.id,
        variantId: selectedVariantId,
        quantity,
      })
      setCartMessage('Produkt wurde in den Warenkorb gelegt.')
    } catch {
      setCartMessage('Warenkorb konnte nicht aktualisiert werden. Bitte melde dich an und versuche es erneut.')
    }
  }

  if (isLoading) {
    return (
      <section className="product-detail-status">
        <p className="eyebrow">Produkt</p>
        <h1>Produkt wird geladen</h1>
      </section>
    )
  }

  if (!detail) {
    return (
      <section className="product-detail-status">
        <p className="eyebrow">Produkt</p>
        <h1>Produkt nicht gefunden</h1>
        <Link to="/products">Zurück zu den Produkten</Link>
      </section>
    )
  }

  const { product, mockProduct, variants, isFallback } = detail
  const palette = mockProduct?.palette ?? 'sunset'
  const material = mockProduct?.material ?? product.categoryName
  const stockQuantity = selectedVariant?.stockQuantity ?? product.stockQuantity
  const canAddToCart = stockQuantity > 0 && (variants.length === 0 || selectedVariantId !== undefined)
  const productImages = [
    ...(product.imageUrl ? [product.imageUrl] : []),
    ...(product.imageUrls ?? []),
  ].filter((imageUrl, index, imageUrls) => imageUrl && imageUrls.indexOf(imageUrl) === index)
  const activeImageUrl =
    selectedImageUrl && productImages.includes(selectedImageUrl)
      ? selectedImageUrl
      : productImages[0] ?? null

  return (
      <>
        <nav className="breadcrumb" style={{ margin: '20px', padding: '10px 0' }} aria-label="Breadcrumb">
          <Link to="/products" style={{ color: '#8b4513', fontWeight: 'bold' }}>Produkte</Link>
          <span style={{ margin: '0 10px' }}>/</span>
          <span>{product.categoryName}</span>
        </nav>

        <section className="product-detail-layout" style={{ margin: '0 20px 40px 20px' }}>
          <div className="product-detail-media">
            <ProductVisual imageUrl={activeImageUrl} palette={palette} label={product.name} />
            {productImages.length > 1 && (
              <div className="product-gallery-thumbs" aria-label="Produktbilder">
                {productImages.map((imageUrl, index) => (
                  <button
                    key={imageUrl}
                    className={activeImageUrl === imageUrl ? 'active' : undefined}
                    type="button"
                    onClick={() => setSelectedImageUrl(imageUrl)}
                    aria-label={`Produktbild ${index + 1} anzeigen`}
                  >
                    <ProductVisual imageUrl={imageUrl} palette={palette} label={`${product.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-detail-info">
            <p className="eyebrow" style={{ color: '#8b4513', fontWeight: 'bold', textTransform: 'uppercase' }}>
              {product.categoryName}
            </p>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{product.name}</h1>
            <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.6' }}>{product.description}</p>
          <dl className="product-facts">
            <div>
              <dt>Material</dt>
              <dd>{material}</dd>
            </div>
            <div>
              <dt>Bestand</dt>
              <dd>{stockQuantity} verfügbar</dd>
            </div>
            <div>
              <dt>Preis</dt>
              <dd>{product.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</dd>
            </div>
          </dl>

          {variants.length > 0 && (
            <div className="variant-picker">
              <p>Variante</p>
              <div>
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    className={selectedVariantId === variant.id ? 'active' : undefined}
                    type="button"
                    onClick={() => setSelectedVariantId(variant.id)}
                  >
                    {variant.variantLabel}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="purchase-row">
            <label>
              <span>Menge</span>
              <input
                min="1"
                max={Math.max(stockQuantity, 1)}
                type="number"
                value={quantity}
                onChange={(event) => {
                  const nextQuantity = Number(event.target.value)
                  setQuantity(Number.isFinite(nextQuantity) ? Math.max(1, nextQuantity) : 1)
                }}
              />
            </label>
            <button type="button" disabled={!canAddToCart} onClick={handleAddToCart}>
              In den Warenkorb
            </button>
          </div>

          {cartMessage && <p className="cart-feedback">{cartMessage}</p>}
          {isFallback && <p className="fallback-note">Demo-Produkt aus dem lokalen Katalog</p>}
        </div>
      </section>
    </>
  )
}
