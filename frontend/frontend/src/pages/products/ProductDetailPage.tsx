import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'

import { cartApi, productApi } from '../../api'
import { ProductVisual } from '../../components/product/ProductVisual'
import { mockProducts, mockVariants, toProductDetail, type StoreProduct } from '../../data/mockStore'
import type { ProductDetailResponse, ProductVariantResponse } from '../../types'

type DetailState = {
  product: ProductDetailResponse
  mockProduct?: StoreProduct
  variants: ProductVariantResponse[]
  isFallback: boolean
  variantsLoadFailed?: boolean
}

type CartFeedback = {
  tone: 'success' | 'error'
  text: string
}

function getAvailabilityLabel(stockQuantity: number) {
  if (stockQuantity <= 0) {
    return 'Ausverkauft'
  }

  if (stockQuantity <= 10) {
    return 'Nur noch wenige verfügbar'
  }

  return 'Auf Lager'
}

function getMarketingBadge(product: ProductDetailResponse, mockProduct?: StoreProduct) {
  if (mockProduct?.tag) {
    return mockProduct.tag
  }

  const badgeIndex = product.id % 4

  if (badgeIndex === 0) {
    return 'Neu'
  }

  if (badgeIndex === 1) {
    return 'Beliebt'
  }

  if (badgeIndex === 2) {
    return 'Bestseller'
  }

  return 'Limitierte Edition'
}

function getAddToCartErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return 'Der Warenkorb konnte gerade nicht aktualisiert werden.'
  }

  const status = error.response?.status

  if (!error.response) {
    return 'Der Warenkorb ist gerade nicht erreichbar. Bitte versuche es gleich noch einmal.'
  }

  if (status === 401) {
    return 'Bitte melde dich an, um den Warenkorb zu nutzen.'
  }

  if (status === 403) {
    return 'Deine Sitzung konnte nicht bestätigt werden. Bitte melde dich erneut an.'
  }

  if (status === 400) {
    return 'Diese Auswahl kann nicht in den Warenkorb gelegt werden.'
  }

  if (status === 409) {
    return 'Die gewünschte Menge ist nicht mehr verfügbar.'
  }

  return 'Der Warenkorb konnte gerade nicht aktualisiert werden.'
}

export function ProductDetailPage() {
  const { id } = useParams()
  const productId = Number(id)
  const [detail, setDetail] = useState<DetailState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariantId, setSelectedVariantId] = useState<number | undefined>()
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
  const [cartFeedback, setCartFeedback] = useState<CartFeedback | null>(null)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadProduct() {
      setIsLoading(true)

      try {
        const product = await productApi.getProduct(productId)
        const variantsResult = await productApi.getVariants(productId)
          .then((variants) => ({ variants, failed: false }))
          .catch(() => ({ variants: [] as ProductVariantResponse[], failed: true }))

        if (isMounted) {
          setDetail({
            product,
            variants: variantsResult.variants,
            isFallback: false,
            variantsLoadFailed: variantsResult.failed,
          })
          setSelectedImageUrl(product.imageUrls?.[0] ?? product.imageUrl ?? null)
          setSelectedVariantId(
            variantsResult.variants.find((variant) => variant.stockQuantity > 0)?.id,
          )
          setCartFeedback(null)
        }
      } catch {
        const mockProduct = mockProducts.find((product) => product.id === productId)
        const mockProductDetail = mockProduct ? toProductDetail(mockProduct) : null
        const variants = mockProduct
          ? mockVariants.filter((variant) => variant.productId === mockProduct.id)
          : []

        if (isMounted) {
          setDetail(
            mockProduct && mockProductDetail
              ? {
                  product: mockProductDetail,
                  mockProduct,
                  variants,
                  isFallback: true,
                }
              : null,
          )
          setSelectedImageUrl(mockProductDetail?.imageUrls?.[0] ?? mockProductDetail?.imageUrl ?? null)
          setSelectedVariantId(variants.find((variant) => variant.stockQuantity > 0)?.id)
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
      setCartFeedback({ tone: 'error', text: 'Bitte zuerst eine Variante auswählen.' })
      return
    }

    if (!Number.isFinite(quantity) || quantity < 1) {
      setCartFeedback({ tone: 'error', text: 'Bitte eine gültige Menge eingeben.' })
      return
    }

    const requestedQuantity = Math.min(quantity, stockQuantity)

    if (requestedQuantity < 1) {
      setCartFeedback({ tone: 'error', text: 'Diese Auswahl ist aktuell nicht verfügbar.' })
      return
    }

    setIsAddingToCart(true)
    setCartFeedback(null)

    try {
      await cartApi.addItem({
        productId: detail.product.id,
        variantId: selectedVariantId,
        quantity: requestedQuantity,
      })
      setCartFeedback({ tone: 'success', text: 'Artikel wurde in den Warenkorb gelegt.' })
    } catch (error) {
      setCartFeedback({ tone: 'error', text: getAddToCartErrorMessage(error) })
    } finally {
      setIsAddingToCart(false)
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
  const availabilityLabel = getAvailabilityLabel(stockQuantity)
  const marketingBadge = getMarketingBadge(product, mockProduct)
  const canAddToCart =
    !detail.variantsLoadFailed &&
    stockQuantity > 0 &&
    (variants.length === 0 || selectedVariantId !== undefined)
  const addToCartLabel = isAddingToCart
    ? 'Wird hinzugefügt'
    : detail.variantsLoadFailed
      ? 'Auswahl nicht geladen'
    : stockQuantity <= 0
      ? 'Nicht verfügbar'
      : 'In den Warenkorb'
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
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/products">Produkte</Link>
          <span>{product.categoryName}</span>
        </nav>

        <section className="product-detail-layout">
          <div className="product-detail-media">
            <ProductVisual
              imageUrl={activeImageUrl}
              palette={palette}
              label={product.name}
              caption={product.categoryName}
            />
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
                    <ProductVisual
                      imageUrl={imageUrl}
                      palette={palette}
                      label={`${product.name} ${index + 1}`}
                      caption={product.categoryName}
                    />
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
              <dt>Verfügbarkeit</dt>
              <dd>{availabilityLabel}</dd>
            </div>
            <div>
              <dt>Hinweis</dt>
              <dd>{marketingBadge}</dd>
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
                    disabled={!variant.active || variant.stockQuantity <= 0}
                    type="button"
                    onClick={() => {
                      setSelectedVariantId(variant.id)
                      setQuantity(1)
                      setCartFeedback(null)
                    }}
                  >
                    {variant.variantLabel}
                    {(!variant.active || variant.stockQuantity <= 0) && ' - ausverkauft'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="purchase-row">
            <label>
              <span>Menge</span>
              <input
                inputMode="numeric"
                min="1"
                max={Math.max(stockQuantity, 1)}
                type="number"
                value={quantity}
                onChange={(event) => {
                  const nextQuantity = Number(event.target.value)
                  const maxQuantity = Math.max(stockQuantity, 1)
                  setCartFeedback(null)
                  setQuantity(Number.isFinite(nextQuantity) ? Math.min(Math.max(1, nextQuantity), maxQuantity) : 1)
                }}
              />
            </label>
            <button type="button" disabled={!canAddToCart || isAddingToCart} onClick={handleAddToCart}>
              {addToCartLabel}
            </button>
          </div>

          {cartFeedback && (
            <p className={`cart-feedback ${cartFeedback.tone}`} role={cartFeedback.tone === 'error' ? 'alert' : 'status'}>
              <span>{cartFeedback.text}</span>
              {cartFeedback.tone === 'success' && <Link to="/cart">Zum Warenkorb</Link>}
            </p>
          )}
          {detail.variantsLoadFailed && (
            <p className="cart-feedback error" role="alert">
              Varianten konnten gerade nicht geladen werden. Bitte öffne das Produkt erneut.
            </p>
          )}
          {isFallback && <p className="fallback-note">Produktdaten sind momentan offline verfügbar.</p>}
        </div>
      </section>
    </>
  )
}
