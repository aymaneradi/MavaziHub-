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

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export type UserProfile = {
  id: string
  firstname: string
  lastname: string
  email: string
  phoneNumber: string
  roles: string[]
}
