export type {
  Category,
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from './category'

export type {
  CreateProductVariantRequest,
  ProductVariantResponse,
  UpdateProductVariantRequest,
  UpdateStockRequest,
  Variant,
} from './variant'

export type ProductResponse = {
  id: number
  name: string
  price: number
  imageUrl: string | null
  imageUrls?: string[]
  stockQuantity: number
  categoryId: number
  categoryName: string
  active: boolean
}

export type Product = ProductResponse

export type ProductDetailResponse = ProductResponse & {
  description: string
  createdAt: string
  updatedAt: string
}

export type CreateProductRequest = {
  name: string
  description?: string
  price: number
  imageUrl?: string
  imageUrls?: string[]
  stockQuantity: number
  categoryId: number
}

export type UpdateProductRequest = CreateProductRequest

export type ProductPalette = 'sunset' | 'gold' | 'indigo' | 'leaf'

export type FeaturedProduct = {
  id: number
  name: string
  price: string
  palette: ProductPalette
  material: string
  isNew: boolean
}
