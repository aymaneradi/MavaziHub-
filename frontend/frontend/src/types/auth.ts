import type { UserResponse } from './user'
export type {
  AdminUserResponse,
  AssignRoleRequest,
  ChangePasswordRequest,
  UpdateUserRequest,
  UpdateUserRolesRequest,
  User,
  UserRole,
} from './user'

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  firstname: string
  lastname: string
  phonenumber: string
  email: string
  password: string
}

export type RefreshRequest = {
  refreshToken: string
}

export type LogoutRequest = RefreshRequest

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export type { UserResponse }
