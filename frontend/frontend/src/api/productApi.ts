import { axiosClient } from './axiosClient'
import type { ProductDetailResponse, ProductResponse, ProductVariantResponse } from '../types'

export type ProductQuery = {
  categoryId?: number
  search?: string
}

export const productApi = {
  async getProducts(params?: ProductQuery): Promise<ProductResponse[]> {
    const { data } = await axiosClient.get<ProductResponse[]>('/products', { params })
    return data
  },

  async getProduct(id: number): Promise<ProductDetailResponse> {
    const { data } = await axiosClient.get<ProductDetailResponse>(`/products/${id}`)
    return data
  },

  async getVariants(productId: number): Promise<ProductVariantResponse[]> {
    const { data } = await axiosClient.get<ProductVariantResponse[]>(
      `/products/${productId}/variants`,
    )
    return data
  },
}
