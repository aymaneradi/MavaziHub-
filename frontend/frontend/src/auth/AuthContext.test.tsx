import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { AuthProvider, useAuth } from './AuthContext'
import { server } from '../test/mockServer'

/**
 * Kleine Test-Komponente, die useAuth() konsumiert und den Zustand
 * sichtbar macht. So testen wir AuthContext über seine öffentliche
 * Schnittstelle (Verhalten), nicht über Implementierungsdetails.
 */
function TestConsumer() {
    const auth = useAuth()

    if (auth.isLoading) return <p data-testid="status">loading</p>

    return (
        <div>
            <p data-testid="status">
                {auth.isAuthenticated ? `logged-in:${auth.user?.email}` : 'logged-out'}
            </p>
            <button onClick={() => auth.login({ email: 'jane@test.com', password: 'secret123' })}>
                login
            </button>
            {/* AuthContext.logout() wirft nach dem finally-Block bewusst weiter
          (siehe Kommentar in AuthContext.tsx) - die echte Navbar-Komponente
          entscheidet selbst, ob sie darauf reagiert. Unsere Test-Komponente
          interessiert sich hier nur für den User-State danach, daher fangen
          wir die Rejection ab wie beim reload-Button. */}
            <button onClick={() => auth.logout().catch(() => undefined)}>logout</button>
            <button onClick={() => auth.reloadUser().catch(() => undefined)}>reload</button>
        </div>
    )
}

function renderAuth() {
    return render(
        <AuthProvider>
            <TestConsumer />
        </AuthProvider>,
    )
}

describe('AuthProvider - Bootstrap beim App-Start', () => {
    it('lädt den User automatisch wenn der accessToken-Cookie noch gültig ist', async () => {
        // Default-Handler liefert /users/me erfolgreich zurück
        renderAuth()

        // Zuerst muss der Ladezustand sichtbar sein...
        expect(screen.getByTestId('status')).toHaveTextContent('loading')

        // ...dann der eingeloggte User (aus /users/me)
        await waitFor(() =>
            expect(screen.getByTestId('status')).toHaveTextContent('logged-in:jane@test.com'),
        )
    })

    it('zeigt "logged-out" ohne Fehler wenn kein gültiger Token vorhanden ist', async () => {
        server.use(http.get('/api/users/me', () => new HttpResponse(null, { status: 401 })))
        server.use(http.post('/api/auth/refresh', () => new HttpResponse(null, { status: 401 })))

        renderAuth()

        await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('logged-out'))
    })
})

describe('AuthProvider - login()', () => {
    it('lädt nach erfolgreichem Login automatisch die User-Daten', async () => {
        // Beim ersten /users/me-Aufruf (Bootstrap) noch nicht eingeloggt.
        // { once: true } gehört als drittes Argument zu http.get/post selbst,
        // nicht zu server.use() - danach greift wieder der Default-Handler
        // aus mockServer.ts (erfolgreiches /users/me).
        server.use(
            http.get('/api/users/me', () => new HttpResponse(null, { status: 401 }), { once: true }),
            http.post('/api/auth/refresh', () => new HttpResponse(null, { status: 401 }), {
                once: true,
            }),
        )

        const user = userEvent.setup()
        renderAuth()

        await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('logged-out'))

        await user.click(screen.getByText('login'))

        await waitFor(() =>
            expect(screen.getByTestId('status')).toHaveTextContent('logged-in:jane@test.com'),
        )
    })
})

describe('AuthProvider - logout()', () => {
    it('setzt den User-State auch zurück wenn der Logout-Request fehlschlägt', async () => {
        const user = userEvent.setup()
        renderAuth()

        await waitFor(() =>
            expect(screen.getByTestId('status')).toHaveTextContent('logged-in:jane@test.com'),
        )

        // Logout-Endpoint schlägt fehl (z.B. Netzwerkproblem) -
        // der lokale State muss trotzdem zurückgesetzt werden (finally-Block)
        server.use(http.post('/api/auth/logout', () => new HttpResponse(null, { status: 500 })))

        await user.click(screen.getByText('logout'))

        await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('logged-out'))
    })
})

describe('AuthProvider - unauthorizedHandler (axiosClient-Integration)', () => {
    it('loggt den User aus wenn ein Refresh nach 401 ebenfalls fehlschlägt', async () => {
        const user = userEvent.setup()
        renderAuth()

        await waitFor(() =>
            expect(screen.getByTestId('status')).toHaveTextContent('logged-in:jane@test.com'),
        )

        // Access Token ist jetzt "abgelaufen" UND der Refresh Token ebenfalls -
        // simuliert einen Nutzer, der z.B. nach 7 Tagen Inaktivität zurückkommt.
        server.use(http.get('/api/users/me', () => new HttpResponse(null, { status: 401 })))
        server.use(http.post('/api/auth/refresh', () => new HttpResponse(null, { status: 401 })))

        await user.click(screen.getByText('reload'))

        // axiosClient versucht intern den Refresh, der fehlschlägt, ruft
        // daraufhin unauthorizedHandler() auf -> AuthContext setzt user=null
        await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('logged-out'))
    })
})