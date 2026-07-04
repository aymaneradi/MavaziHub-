export type Category = {
  id: number
  name: string
  description: string
}

export type CategoryResponse = Category

export type CreateCategoryRequest = {
  name: string
  description?: string
}

export type UpdateCategoryRequest = CreateCategoryRequest
