import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ProductListPage from './pages/products/ProductListPage'
import ProductDetailPage from './pages/products/ProductDetailPage'

type PlaceholderPageProps = {
  title: string
  description: string
}

function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="mh-page">
      <div className="mh-card">
        <span className="mh-badge">Platzhalter</span>
        <h1 className="mh-section-title">{title}</h1>
        <p className="mh-text-muted">{description}</p>
      </div>
    </section>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/products" replace />} />

        <Route path="/products" element={<ProductListPage />} />

        <Route path="/products/:id" element={<ProductDetailPage />} />

        <Route
          path="/cart"
          element={
            <PlaceholderPage
              title="Warenkorb"
              description="Hier entsteht der Warenkorb mit Mengenänderung und Checkout-Link."
            />
          }
        />

        <Route
          path="/checkout"
          element={
            <PlaceholderPage
              title="Checkout"
              description="Hier entsteht der Checkout zur Erstellung einer Bestellung aus dem Warenkorb."
            />
          }
        />

        <Route
          path="/orders"
          element={
            <PlaceholderPage
              title="Meine Bestellungen"
              description="Hier entsteht die Bestellhistorie des angemeldeten Benutzers."
            />
          }
        />

        <Route
          path="/returns"
          element={
            <PlaceholderPage
              title="Meine Rücksendungen"
              description="Hier entsteht die Übersicht der eigenen Rücksendungen."
            />
          }
        />

        <Route
          path="/login"
          element={
            <PlaceholderPage
              title="Login"
              description="Hier entsteht die Login-Seite."
            />
          }
        />

        <Route
          path="/register"
          element={
            <PlaceholderPage
              title="Registrierung"
              description="Hier entsteht die Registrierungsseite."
            />
          }
        />

        <Route
          path="/admin/products"
          element={
            <PlaceholderPage
              title="Admin Produktverwaltung"
              description="Hier entsteht der CoreUI-basierte Admin-Bereich für Produkte."
            />
          }
        />

        <Route
          path="/admin/returns"
          element={
            <PlaceholderPage
              title="Admin Rücksendungsverwaltung"
              description="Hier entsteht der CoreUI-basierte Admin-Bereich für Rücksendungen."
            />
          }
        />

        <Route
          path="*"
          element={
            <PlaceholderPage
              title="Seite nicht gefunden"
              description="Die angeforderte Seite existiert nicht."
            />
          }
        />
      </Route>
    </Routes>
  )
}

export default App