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
        }
      } catch {
        const mockProduct = mockProducts.find((product) => product.id === productId)

        if (isMounted) {
          setDetail(
            mockProduct
              ? {
                  product: toProductDetail(mockProduct),
                  mockProduct,
                  variants: mockVariants.filter((variant) => variant.productId === mockProduct.id),
                  isFallback: true,
                }
              : null,
          )
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

    try {
      await cartApi.addItem({
        productId: detail.product.id,
        variantId: selectedVariantId,
        quantity: Math.max(1, quantity),
      })
      setCartMessage('Produkt wurde in den Warenkorb gelegt.')
    } catch {
      setCartMessage('Warenkorb ist bereit, sobald du angemeldet bist.')
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

  return (
    <>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/products">Produkte</Link>
        <span>{product.categoryName}</span>
      </nav>

      <section className="product-detail-layout">
        <div className="product-detail-media">
          <ProductVisual imageUrl={product.imageUrl} palette={palette} label={product.name} />
        </div>

        <div className="product-detail-info">
          <p className="eyebrow">{product.categoryName}</p>
          <h1>{product.name}</h1>
          <p>{product.description}</p>

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
                onChange={(event) => setQuantity(Number(event.target.value))}
              />
            </label>
            <button type="button" onClick={handleAddToCart}>
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
