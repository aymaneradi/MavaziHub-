import { axiosClient } from './axiosClient'
import type { Category, Product, ProductDetail, ProductQuery } from '../types/Product'

export async function getCategories(): Promise<Category[]> {
  const response = await axiosClient.get<Category[]>('/categories')
  return response.data
}

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  // Axios turns this object into query parameters: /products?categoryId=...&search=...
  const response = await axiosClient.get<Product[]>('/products', {
    params: {
      categoryId: query.categoryId,
      search: query.search || undefined,
    },
  })

  return response.data
}

export async function getProductById(id: number): Promise<ProductDetail> {
  const response = await axiosClient.get<ProductDetail>(`/products/${id}`)
  return response.data
}
