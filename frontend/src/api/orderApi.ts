import { axiosClient } from './axiosClient'
import type { OrderDetail, OrderSummary } from '../types/Order'

export async function getOrderHistory(): Promise<OrderSummary[]> {
  const response = await axiosClient.get<OrderSummary[]>('/me/orders')
  return response.data
}

export async function getOrderById(orderId: string): Promise<OrderDetail> {
  const response = await axiosClient.get<OrderDetail>(`/me/orders/${orderId}`)
  return response.data
}
