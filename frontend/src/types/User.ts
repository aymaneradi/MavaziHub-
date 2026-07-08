export type Role = 'ROLE_ADMIN' | 'ROLE_EMPLOYEE' | 'ROLE_USER'

export interface User {
    id: string
    firstname: string
    lastname: string
    email: string
    phoneNumber: string
    roles: Role[] | string[]
}