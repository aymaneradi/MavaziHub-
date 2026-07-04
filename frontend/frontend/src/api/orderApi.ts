import { axiosClient } from './axiosClient'
import type {
  OrderDetailResponse,
  OrderItemResponse,
  OrderRequest,
  OrderResponse,
  OrderSummaryResponse,
  UUID,
} from '../types'

export const orderApi = {
  async getMyOrders(): Promise<OrderResponse[]> {
    const { data } = await axiosClient.get<OrderResponse[]>('/orders/my')
    return data
  },

  async getOrder(id: UUID): Promise<OrderResponse> {
    const { data } = await axiosClient.get<OrderResponse>(`/orders/${id}`)
    return data
  },

  async checkout(request: OrderRequest): Promise<OrderResponse> {
    const { data } = await axiosClient.post<OrderResponse>('/cart/checkout', request)
    return data
  },

  async getOrderHistory(): Promise<OrderSummaryResponse[]> {
    const { data } = await axiosClient.get<OrderSummaryResponse[]>('/me/orders')
    return data
  },

  async getOrderDetails(orderId: UUID): Promise<OrderDetailResponse> {
    const { data } = await axiosClient.get<OrderDetailResponse>(`/me/orders/${orderId}`)
    return data
  },

  async getReturnableItems(orderId: UUID): Promise<OrderItemResponse[]> {
    const { data } = await axiosClient.get<OrderItemResponse[]>(
      `/me/orders/${orderId}/returnable-items`,
    )
    return data
  },
}
