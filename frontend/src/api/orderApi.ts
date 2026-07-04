import { axiosClient } from './axiosClient'
import type { CheckoutRequest, OrderDetail, OrderSummary } from '../types/Order'

export async function getOrderHistory(): Promise<OrderSummary[]> {
  const response = await axiosClient.get<OrderSummary[]>('/me/orders')
  return response.data
}

export async function getOrderById(orderId: string): Promise<OrderDetail> {
  const response = await axiosClient.get<OrderDetail>(`/me/orders/${orderId}`)
  return response.data
}

export async function checkout(request: CheckoutRequest): Promise<OrderDetail> {
  const response = await axiosClient.post<OrderDetail>('/cart/checkout', request)
  return response.data
}
