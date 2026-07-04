import type { ISODateTimeString, UUID } from './common'

export type UserRole = 'ROLE_USER' | 'ROLE_EMPLOYEE' | 'ROLE_ADMIN'

export type User = {
  id: UUID
  firstname: string
  lastname: string
  email: string
  phoneNumber: string
  roles: UserRole[]
}

export type UserResponse = User

export type AdminUserResponse = User & {
  enabled: boolean
  accountLocked: boolean
  createdAt: ISODateTimeString
}

export type AssignRoleRequest = {
  userId: UUID
  role: UserRole
}

export type UpdateUserRolesRequest = {
  roles: UserRole[]
}

export type UpdateUserRequest = {
  firstname: string
  lastname: string
  email: string
  phoneNumber: string
}

export type ChangePasswordRequest = {
  currentPassword: string
  newPassword: string
}
