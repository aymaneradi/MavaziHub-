import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosClient, setUnauthorizedHandler } from './axiosClient'
import { server } from '../test/mockServer'
import { clearAllCookies } from '../test/setup'

beforeEach(() => {
    clearAllCookies()
    setUnauthorizedHandler(undefined)
})

describe('axiosClient - CSRF-Header-Interceptor', () => {
    it('hängt den csrfToken aus dem Cookie als X-CSRF-Token-Header an', async () => {
        document.cookie = 'csrfToken=abc123'

        server.use(
            http.post('/api/protected-action', ({ request }) =>
                HttpResponse.json({ receivedCsrf: request.headers.get('X-CSRF-Token') }),
            ),
        )

        const response = await axiosClient.post('/protected-action', {})

        expect(response.data.receivedCsrf).toBe('abc123')
    })

    it('schickt keinen Header wenn kein csrfToken-Cookie vorhanden ist', async () => {
        server.use(
            http.post('/api/protected-action', ({ request }) =>
                HttpResponse.json({ receivedCsrf: request.headers.get('X-CSRF-Token') }),
            ),
        )

        const response = await axiosClient.post('/protected-action', {})

        expect(response.data.receivedCsrf).toBeNull()
    })
})

describe('axiosClient - 401-Retry-Logik', () => {
    it('erneuert den Token bei 401 automatisch und wiederholt den Original-Request', async () => {
        let attempt = 0
        let refreshCalls = 0

        server.use(
            http.get('/api/some-protected', () => {
                attempt += 1
                if (attempt === 1) {
                    return new HttpResponse(null, { status: 401 })
                }
                return HttpResponse.json({ ok: true })
            }),
        )

        server.use(
            http.post('/api/auth/refresh', () => {
                refreshCalls += 1
                // Simuliert: Backend hat neue Cookies gesetzt, Browser hat sie
                // gespeichert. In jsdom müssen wir das manuell nachstellen.
                document.cookie = 'csrfToken=rotated-csrf'
                return new HttpResponse(null, { status: 200 })
            }),
        )

        const response = await axiosClient.get('/some-protected')

        expect(response.data).toEqual({ ok: true })
        expect(attempt).toBe(2)
        expect(refreshCalls).toBe(1)
    })

    it('ruft unauthorizedHandler auf wenn der Refresh ebenfalls fehlschlägt', async () => {
        const handler = vi.fn()
        setUnauthorizedHandler(handler)

        server.use(http.get('/api/some-protected', () => new HttpResponse(null, { status: 401 })))
        server.use(http.post('/api/auth/refresh', () => new HttpResponse(null, { status: 401 })))

        await expect(axiosClient.get('/some-protected')).rejects.toThrow()

        expect(handler).toHaveBeenCalledTimes(1)
    })

    it('versucht KEINEN Refresh wenn der 401 von einem Auth-Endpoint selbst kommt', async () => {
        let refreshCalls = 0

        server.use(http.post('/api/auth/login', () => new HttpResponse(null, { status: 401 })))
        server.use(
            http.post('/api/auth/refresh', () => {
                refreshCalls += 1
                return new HttpResponse(null, { status: 200 })
            }),
        )

        await expect(
            axiosClient.post('/auth/login', { email: 'x@test.com', password: 'wrong' }),
        ).rejects.toThrow()

        // Falscher Login darf keinen Refresh-Versuch auslösen -
        // sonst würde bei jedem Fehlversuch unnötig der Refresh-Endpoint getroffen
        expect(refreshCalls).toBe(0)
    })

    it('dedupliziert parallele Refresh-Aufrufe bei gleichzeitigen 401-Antworten', async () => {
        let refreshCalls = 0

        server.use(
            http.get('/api/protected-a', () => new HttpResponse(null, { status: 401 })),
        )
        server.use(
            http.get('/api/protected-b', () => new HttpResponse(null, { status: 401 })),
        )
        server.use(
            http.post('/api/auth/refresh', async () => {
                refreshCalls += 1
                return new HttpResponse(null, { status: 200 })
            }),
        )

        // Beide Requests scheitern letztlich (weil /protected-a und -b weiterhin
        // 401 liefern), aber der Refresh-Endpoint darf nur EINMAL getroffen werden.
        await Promise.allSettled([
            axiosClient.get('/protected-a'),
            axiosClient.get('/protected-b'),
        ])

        expect(refreshCalls).toBe(1)
    })
})