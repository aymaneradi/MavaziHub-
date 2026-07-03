import { Link } from 'react-router-dom'

export type ProductPalette = 'sunset' | 'gold' | 'indigo' | 'leaf'

export type ProductCardProduct = {
  id: number
  name: string
  priceLabel: string
  palette: ProductPalette
  categoryName?: string
  imageUrl?: string | null
  isNew?: boolean
}

type ProductCardProps = {
  product: ProductCardProduct
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <Link className="product-card" to={`/products/${product.id}`}>
      <div className={`product-image product-image-${product.palette}`}>
        {product.imageUrl && <img src={product.imageUrl} alt="" className="product-photo" />}
        {product.isNew && <span className="badge-new">Neu</span>}
      </div>
      <h3>{product.name}</h3>
      <p>{product.categoryName ?? '100% Baumwolle'}</p>
      <strong>{product.priceLabel}</strong>
    </Link>
  )
}

export default ProductCard
