import { axiosClient } from './axiosClient'
import type { AddCartItemRequest, Cart } from '../types/Cart'

export async function getCart(customerId: string): Promise<Cart> {
  const response = await axiosClient.get<Cart>('/cart', {
    params: { customerId },
  })
  return response.data
}

export async function addCartItem(request: AddCartItemRequest): Promise<Cart> {
  const response = await axiosClient.post<Cart>('/cart/items', request)
  return response.data
}

export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<Cart> {
  const response = await axiosClient.put<Cart>(`/cart/items/${itemId}`, null, {
    params: { quantity },
  })
  return response.data
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  const response = await axiosClient.delete<Cart>(`/cart/items/${itemId}`)
  return response.data
}

export async function clearCart(customerId: string): Promise<void> {
  await axiosClient.delete('/cart', {
    params: { customerId },
  })
}
