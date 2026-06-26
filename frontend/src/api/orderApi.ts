import { axiosClient } from './axiosClient'
import { Order } from '../types/Order'

export const getMyOrders = async (customerId: string): Promise<Order[]> => {
  const response = await axiosClient.get<Order[]>('/orders/my', { params: { customerId } })
  return response.data
}

export const getOrderById = async (id: string): Promise<Order> => {
  const response = await axiosClient.get<Order>(/orders/+id)
  return response.data
}
