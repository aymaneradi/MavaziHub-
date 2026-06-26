import { axiosClient } from './axiosClient'
import { CheckoutRequest, CheckoutResponse } from '../types/Checkout'

export const checkout = async (request: CheckoutRequest): Promise<CheckoutResponse> => {
  const response = await axiosClient.post<CheckoutResponse>('/cart/checkout', request)
  return response.data
}
