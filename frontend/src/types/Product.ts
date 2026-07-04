export type Category = {
  id: number
  name: string
  description: string | null
}

export type Product = {
  id: number
  name: string
  price: number
  imageUrl: string | null
  stockQuantity: number
  categoryId: number
  categoryName: string
  active: boolean
}

export type ProductDetail = Product & {
  description: string | null
  createdAt: string
  updatedAt: string | null
}

export type ProductQuery = {
  categoryId?: number
  search?: string
}
