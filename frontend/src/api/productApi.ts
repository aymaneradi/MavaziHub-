import { axiosClient } from './axiosClient'
import type { Category, Product, ProductDetail, ProductVariant } from '../types/Product'

export async function getCategories(): Promise<Category[]> {
  const response = await axiosClient.get<Category[]>('/categories')
  return response.data
}

export async function getProducts(categoryId?: number | null): Promise<Product[]> {
  const response = await axiosClient.get<Product[]>('/products', {
    params: categoryId ? { categoryId } : undefined,
  })

  return response.data
}

export async function getProductById(id: number | string): Promise<ProductDetail> {
  const response = await axiosClient.get<ProductDetail>(`/products/${id}`)
  return response.data
}

export async function getProductVariants(
  productId: number | string,
): Promise<ProductVariant[]> {
  const response = await axiosClient.get<ProductVariant[]>(
    `/products/${productId}/variants`,
  )

  return response.data
}