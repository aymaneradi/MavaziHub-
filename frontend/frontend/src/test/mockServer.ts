import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

export const server = setupServer(
    http.post('/api/auth/register', () => new HttpResponse(null, { status: 201 })),

    http.post('/api/auth/login', () => new HttpResponse(null, { status: 200 })),

    http.get('/api/users/me', () =>
        HttpResponse.json({
            id: 'user-1',
            firstname: 'Jane',
            lastname: 'Doe',
            email: 'jane@test.com',
            phoneNumber: '0000000000',
            roles: ['ROLE_USER'],
        }),
    ),

    http.post('/api/auth/refresh', () => new HttpResponse(null, { status: 200 })),

    http.post('/api/auth/logout', () => new HttpResponse(null, { status: 204 })),
)