import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { ProtectedRoute } from './ProtectedRoute'
import { useAuth } from './AuthContext'

// AuthContext wird gemockt - ProtectedRoute soll isoliert getestet werden,
// unabhängig davon ob AuthProvider/axiosClient korrekt funktionieren
// (das decken die AuthContext- und axiosClient-Tests bereits ab).
vi.mock('./AuthContext', () => ({
    useAuth: vi.fn(),
}))

const mockedUseAuth = vi.mocked(useAuth)

function renderWithRoute(initialPath: string, roles?: Array<'ROLE_ADMIN' | 'ROLE_EMPLOYEE' | 'ROLE_USER'>) {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
                <Route path="/login" element={<p>Login-Seite</p>} />
                <Route path="/" element={<p>Startseite</p>} />
                <Route element={<ProtectedRoute roles={roles} />}>
                    <Route path="/admin" element={<p>Admin-Seite</p>} />
                </Route>
            </Routes>
        </MemoryRouter>,
    )
}

describe('ProtectedRoute', () => {
    it('zeigt den Ladezustand solange der Auth-Check läuft', () => {
        mockedUseAuth.mockReturnValue({
            isLoading: true,
            isAuthenticated: false,
            user: null,
            roles: [],
            hasAnyRole: () => false,
        } as unknown as ReturnType<typeof useAuth>)

        renderWithRoute('/admin')

        expect(screen.getByText('Zugang wird geprüft')).toBeInTheDocument()
        expect(screen.queryByText('Admin-Seite')).not.toBeInTheDocument()
    })

    it('leitet zu /login um wenn der User nicht eingeloggt ist', () => {
        mockedUseAuth.mockReturnValue({
            isLoading: false,
            isAuthenticated: false,
            user: null,
            roles: [],
            hasAnyRole: () => false,
        } as unknown as ReturnType<typeof useAuth>)

        renderWithRoute('/admin')

        expect(screen.getByText('Login-Seite')).toBeInTheDocument()
        expect(screen.queryByText('Admin-Seite')).not.toBeInTheDocument()
    })

    it('leitet zur Startseite um wenn der User eingeloggt ist, aber die Rolle fehlt', () => {
        mockedUseAuth.mockReturnValue({
            isLoading: false,
            isAuthenticated: true,
            user: { id: '1', email: 'user@test.com', roles: ['ROLE_USER'] },
            roles: ['ROLE_USER'],
            hasAnyRole: (required: string[]) => required.includes('ROLE_USER'),
        } as unknown as ReturnType<typeof useAuth>)

        renderWithRoute('/admin', ['ROLE_ADMIN'])

        expect(screen.getByText('Startseite')).toBeInTheDocument()
        expect(screen.queryByText('Admin-Seite')).not.toBeInTheDocument()
    })

    it('rendert die geschützte Seite wenn der User authentifiziert ist und die Rolle passt', () => {
        mockedUseAuth.mockReturnValue({
            isLoading: false,
            isAuthenticated: true,
            user: { id: '1', email: 'admin@test.com', roles: ['ROLE_ADMIN'] },
            roles: ['ROLE_ADMIN'],
            hasAnyRole: (required: string[]) => required.includes('ROLE_ADMIN'),
        } as unknown as ReturnType<typeof useAuth>)

        renderWithRoute('/admin', ['ROLE_ADMIN'])

        expect(screen.getByText('Admin-Seite')).toBeInTheDocument()
    })

    it('rendert die geschützte Seite wenn keine Rollen gefordert sind (nur Login-Pflicht)', () => {
        mockedUseAuth.mockReturnValue({
            isLoading: false,
            isAuthenticated: true,
            user: { id: '1', email: 'user@test.com', roles: ['ROLE_USER'] },
            roles: ['ROLE_USER'],
            hasAnyRole: () => true,
        } as unknown as ReturnType<typeof useAuth>)

        renderWithRoute('/admin')

        expect(screen.getByText('Admin-Seite')).toBeInTheDocument()
    })
})