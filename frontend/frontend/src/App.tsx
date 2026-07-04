import { Navigate, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from './auth/ProtectedRoute'
import { AdminLayout } from './components/layout/AdminLayout'
import { ShopLayout } from './components/layout/ShopLayout'
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage'
import { AdminProductFormPage } from './pages/admin/AdminProductFormPage'
import { AdminProductVariantsPage } from './pages/admin/AdminProductVariantsPage'
import { AdminProductsPage } from './pages/admin/AdminProductsPage'
import { AdminReturnsPage } from './pages/admin/AdminReturnsPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { CartPage } from './pages/cart/CartPage'
import { CheckoutPage } from './pages/checkout/CheckoutPage'
import { HomePage } from './pages/home/HomePage'
import { OrderDetailPage } from './pages/orders/OrderDetailPage'
import { OrdersPage } from './pages/orders/OrdersPage'
import { ProductDetailPage } from './pages/products/ProductDetailPage'
import { ProductsPage } from './pages/products/ProductsPage'
import { ProfilePage } from './pages/profile/ProfilePage'
import { NewReturnPage } from './pages/returns/NewReturnPage'
import { ReturnsPage } from './pages/returns/ReturnsPage'

function App() {
  return (
    <Routes>
      <Route element={<ShopLayout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="returns/new" element={<NewReturnPage />} />
          <Route path="returns" element={<ReturnsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['ROLE_ADMIN', 'ROLE_EMPLOYEE']} />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/new" element={<AdminProductFormPage />} />
          <Route path="products/:id/edit" element={<AdminProductFormPage />} />
          <Route path="products/:id/variants" element={<AdminProductVariantsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="returns" element={<AdminReturnsPage />} />
          <Route element={<ProtectedRoute roles={['ROLE_ADMIN']} redirectTo="/admin" />}>
            <Route path="users" element={<AdminUsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
