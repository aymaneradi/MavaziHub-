import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './mockServer'


export function clearAllCookies() {
    const cookies = document.cookie.split(';')

    for (const cookie of cookies) {
        const eqPos = cookie.indexOf('=')
        const name = (eqPos > -1 ? cookie.substring(0, eqPos) : cookie).trim()
        if (name) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        }
    }
}

// MSW-Server für die gesamte Testsuite starten/stoppen.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
    server.resetHandlers()
    clearAllCookies()
})

afterAll(() => server.close())