import { axiosClient } from './axiosClient'
import type { CartItemRequest, CartResponse, OrderRequest, OrderResponse, UUID } from '../types'

export const cartApi = {
  async getCart(): Promise<CartResponse> {
    const { data } = await axiosClient.get<CartResponse>('/cart')
    return data
  },

  async addItem(request: CartItemRequest): Promise<CartResponse> {
    const { data } = await axiosClient.post<CartResponse>('/cart/items', request)
    return data
  },

  async updateItemQuantity(itemId: UUID, quantity: number): Promise<CartResponse> {
    const { data } = await axiosClient.put<CartResponse>(`/cart/items/${itemId}`, null, {
      params: { quantity },
    })
    return data
  },

  async removeItem(itemId: UUID): Promise<CartResponse> {
    const { data } = await axiosClient.delete<CartResponse>(`/cart/items/${itemId}`)
    return data
  },

  async clearCart(): Promise<void> {
    await axiosClient.delete('/cart')
  },

  async checkout(request: OrderRequest): Promise<OrderResponse> {
    const { data } = await axiosClient.post<OrderResponse>('/cart/checkout', request)
    return data
  },
}
