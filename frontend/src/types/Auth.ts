export interface RegisterRequest {
    firstname: string
    lastname: string
    phonenumber: string
    email: string
    password: string
}

export interface LoginRequest {
    email: string
    password: string
}

export interface AuthResponse {
    accessToken: string
    refreshToken: string
    expiresIn: number
}