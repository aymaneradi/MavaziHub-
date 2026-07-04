import { Outlet } from 'react-router-dom'

import { Footer } from './Footer'
import { Header } from './Header'

export function ShopLayout() {
  return (
    <div className="shop-shell">
      <Header />
      <main className="shop-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
