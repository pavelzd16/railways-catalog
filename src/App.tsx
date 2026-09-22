// src/app/App.tsx
import { Route, Routes } from 'react-router'
import { NotFoundPage } from './pages/not-found/NotFoundPage'
import { AboutPage } from './pages/about/AboutPage'
import { CatalogPage } from './pages/catalog/ui/CatalogPage'
import { ContactsPage } from './pages/contacts/ContactsPage'
import { DeliveryPage } from './pages/delivery/DeliveryPage'
import { ServicesPage } from './pages/services/ServicesPage'
import { ServicePage } from './pages/service/ServicePage'
import { CartPage } from './pages/cart/CartPage'
import { AdminLoginPage } from './entities/auth'
import { ProtectedRoute } from './shared/ui/ProtectedRoute'
import { ProductPage } from './pages/catalog'
import { ToastContainer } from 'react-toastify'
import { AdminPage } from './pages/admin'
import { HomePage } from './pages/home/HomePage'
import { PrivacyPage } from './pages/privacy/PrivacyPage'
import { CalculatorPage } from './pages/calculator/CalculatorPage'

export function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route
          path="/catalog/:categorySlug/:subcategorySlug/product/:productSlug"
          element={<ProductPage />}
        />
        <Route path="/catalog/:categorySlug/product/:productSlug" element={<ProductPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:slug" element={<ServicePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/delivery" element={<DeliveryPage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App
