import { Navigate, Route, Routes } from 'react-router-dom'
import SiteHeader from './components/layout/SiteHeader'
import CartPage from './pages/CartPage'
import CreateReturnPage from './pages/CreateReturnPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import OrderDetailPage from './pages/OrderDetailPage'
import OrdersPage from './pages/OrdersPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProductsPage from './pages/ProductsPage'
import ReturnDetailPage from './pages/ReturnDetailPage'
import ReturnsPage from './pages/ReturnsPage'

function App() {
  return (
    <div className="shop-shell">
      <SiteHeader />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/orders/:orderId/returns" element={<CreateReturnPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/returns/:returnId" element={<ReturnDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
