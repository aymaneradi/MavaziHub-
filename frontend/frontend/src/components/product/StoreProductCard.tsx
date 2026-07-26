import { Link } from 'react-router-dom'

import type { StoreProduct } from '../../data/mockStore'
import type { ProductResponse } from '../../types'
import { ProductVisual } from './ProductVisual'

type StoreProductCardProps = {
  product: ProductResponse | StoreProduct
}

function getPalette(product: ProductResponse | StoreProduct) {
  return 'palette' in product ? product.palette : 'sunset'
}

function getMaterial(product: ProductResponse | StoreProduct) {
  return 'material' in product ? product.material : product.categoryName
}

function getTag(product: ProductResponse | StoreProduct) {
  if ('tag' in product) {
    return product.tag
  }

  if (!product.active) {
    return 'Inaktiv'
  }

  const badges = ['Beliebt', 'Bestseller', 'Limitierte Edition', 'Neu']
  return badges[product.id % badges.length]
}

function getPrimaryImageUrl(product: ProductResponse | StoreProduct) {
  return product.imageUrl || product.imageUrls?.[0] || null
}

export function StoreProductCard({ product }: StoreProductCardProps) {
  return (
    <article className="store-product-card">
      <Link to={`/products/${product.id}`} aria-label={`${product.name} ansehen`}>
        <ProductVisual
          imageUrl={getPrimaryImageUrl(product)}
          palette={getPalette(product)}
          label={product.name}
          caption={product.categoryName}
        />
      </Link>
      <div className="store-product-meta">
        <span>{getTag(product)}</span>
        <span>{product.categoryName}</span>
      </div>
      <h3>
        <Link to={`/products/${product.id}`}>{product.name}</Link>
      </h3>
      <p>{getMaterial(product)}</p>
      <div className="store-product-price">
        <strong>{product.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</strong>
        <Link to={`/products/${product.id}`}>Details</Link>
      </div>
    </article>
  )
}
