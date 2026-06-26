export type Category = {
  id: number
  name: string
  description?: string | null
}

export type Product = {
  id: number
  name: string
  description?: string | null
  price: number
  imageUrl?: string | null
  categoryId?: number | null
  categoryName?: string | null
  active?: boolean
}

export type ProductDetail = Product & {
  createdAt?: string | null
  updatedAt?: string | null
}

export type ProductVariant = {
  id: number
  productId?: number
  size?: string | null
  color?: string | null
  pattern?: string | null
  stockQuantity: number
  active?: boolean
  variantLabel?: string | null
}