import { axiosClient } from './axiosClient'
import type {
  AdminUserResponse,
  AssignRoleRequest,
  CategoryResponse,
  CreateCategoryRequest,
  CreateProductRequest,
  CreateProductVariantRequest,
  OrderResponse,
  ProductDetailResponse,
  ProductImageUploadResponse,
  ProductResponse,
  ProductVariantResponse,
  ReturnRequestResponseDTO,
  UpdateCategoryRequest,
  UpdateProductRequest,
  UpdateProductVariantRequest,
  UpdateStockRequest,
  UpdateUserRolesRequest,
  UUID,
} from '../types'

export const adminApi = {
  async getCategories(): Promise<CategoryResponse[]> {
    const { data } = await axiosClient.get<CategoryResponse[]>('/admin/categories')
    return data
  },

  async getCategory(id: number): Promise<CategoryResponse> {
    const { data } = await axiosClient.get<CategoryResponse>(`/admin/categories/${id}`)
    return data
  },

  async createCategory(request: CreateCategoryRequest): Promise<CategoryResponse> {
    const { data } = await axiosClient.post<CategoryResponse>('/admin/categories', request)
    return data
  },

  async updateCategory(id: number, request: UpdateCategoryRequest): Promise<CategoryResponse> {
    const { data } = await axiosClient.put<CategoryResponse>(`/admin/categories/${id}`, request)
    return data
  },

  async getProducts(): Promise<ProductResponse[]> {
    const { data } = await axiosClient.get<ProductResponse[]>('/admin/products')
    return data
  },

  async getProduct(id: number): Promise<ProductDetailResponse> {
    const { data } = await axiosClient.get<ProductDetailResponse>(`/admin/products/${id}`)
    return data
  },

  async createProduct(request: CreateProductRequest): Promise<ProductDetailResponse> {
    const { data } = await axiosClient.post<ProductDetailResponse>('/admin/products', request)
    return data
  },

  async updateProduct(id: number, request: UpdateProductRequest): Promise<ProductDetailResponse> {
    const { data } = await axiosClient.put<ProductDetailResponse>(`/admin/products/${id}`, request)
    return data
  },

  async uploadProductImage(file: File): Promise<ProductImageUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await axiosClient.post<ProductImageUploadResponse>(
      '/admin/products/images',
      formData,
    )
    return data
  },

  async deactivateProduct(id: number): Promise<ProductDetailResponse> {
    const { data } = await axiosClient.patch<ProductDetailResponse>(
      `/admin/products/${id}/deactivate`,
    )
    return data
  },

  async publishProduct(id: number): Promise<ProductDetailResponse> {
    const { data } = await axiosClient.patch<ProductDetailResponse>(`/admin/products/${id}/publish`)
    return data
  },

  async getVariants(productId: number): Promise<ProductVariantResponse[]> {
    const { data } = await axiosClient.get<ProductVariantResponse[]>(
      `/admin/products/${productId}/variants`,
    )
    return data
  },

  async createVariant(
    productId: number,
    request: CreateProductVariantRequest,
  ): Promise<ProductVariantResponse> {
    const { data } = await axiosClient.post<ProductVariantResponse>(
      `/admin/products/${productId}/variants`,
      request,
    )
    return data
  },

  async updateVariant(
    productId: number,
    variantId: number,
    request: UpdateProductVariantRequest,
  ): Promise<ProductVariantResponse> {
    const { data } = await axiosClient.put<ProductVariantResponse>(
      `/admin/products/${productId}/variants/${variantId}`,
      request,
    )
    return data
  },

  async updateVariantStock(
    productId: number,
    variantId: number,
    request: UpdateStockRequest,
  ): Promise<ProductVariantResponse> {
    const { data } = await axiosClient.patch<ProductVariantResponse>(
      `/admin/products/${productId}/variants/${variantId}/stock`,
      request,
    )
    return data
  },

  async deactivateVariant(productId: number, variantId: number): Promise<ProductVariantResponse> {
    const { data } = await axiosClient.patch<ProductVariantResponse>(
      `/admin/products/${productId}/variants/${variantId}/deactivate`,
    )
    return data
  },

  async activateVariant(productId: number, variantId: number): Promise<ProductVariantResponse> {
    const { data } = await axiosClient.patch<ProductVariantResponse>(
      `/admin/products/${productId}/variants/${variantId}/activate`,
    )
    return data
  },

  async getUsers(): Promise<AdminUserResponse[]> {
    const { data } = await axiosClient.get<AdminUserResponse[]>('/admin/users')
    return data
  },

  async getUser(id: UUID): Promise<AdminUserResponse> {
    const { data } = await axiosClient.get<AdminUserResponse>(`/admin/users/${id}`)
    return data
  },

  async updateUserRoles(id: UUID, request: UpdateUserRolesRequest): Promise<AdminUserResponse> {
    const { data } = await axiosClient.patch<AdminUserResponse>(`/admin/users/${id}/roles`, request)
    return data
  },

  async assignRole(request: AssignRoleRequest): Promise<void> {
    await axiosClient.post('/admin/users/assign-role', request)
  },

  async removeRole(request: AssignRoleRequest): Promise<void> {
    await axiosClient.post('/admin/users/remove-role', request)
  },

  async lockUser(id: UUID): Promise<void> {
    await axiosClient.patch(`/admin/users/${id}/lock`)
  },

  async unlockUser(id: UUID): Promise<void> {
    await axiosClient.patch(`/admin/users/${id}/unlock`)
  },

  async disableUser(id: UUID): Promise<void> {
    await axiosClient.patch(`/admin/users/${id}/disable`)
  },

  async enableUser(id: UUID): Promise<void> {
    await axiosClient.patch(`/admin/users/${id}/enable`)
  },

  async deleteUser(id: UUID): Promise<void> {
    await axiosClient.delete(`/admin/users/${id}`)
  },

  async getOrders(): Promise<OrderResponse[]> {
    const { data } = await axiosClient.get<OrderResponse[]>('/admin/orders')
    return data
  },

  async getOrder(id: UUID): Promise<OrderResponse> {
    const { data } = await axiosClient.get<OrderResponse>(`/admin/orders/${id}`)
    return data
  },

  async updateOrderStatus(id: UUID, status: string): Promise<OrderResponse> {
    const { data } = await axiosClient.patch<OrderResponse>(`/admin/orders/${id}/status`, {
      status,
    })
    return data
  },

  async getReturns(): Promise<ReturnRequestResponseDTO[]> {
    const { data } = await axiosClient.get<ReturnRequestResponseDTO[]>('/admin/returns')
    return data
  },

  async getReturn(id: UUID): Promise<ReturnRequestResponseDTO> {
    const { data } = await axiosClient.get<ReturnRequestResponseDTO>(`/admin/returns/${id}`)
    return data
  },

  async updateReturnStatus(id: UUID, status: string): Promise<ReturnRequestResponseDTO> {
    const { data } = await axiosClient.patch<ReturnRequestResponseDTO>(
      `/admin/returns/${id}/status`,
      { status },
    )
    return data
  },
}
