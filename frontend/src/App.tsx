import { Navigate, Route, Routes } from 'react-router-dom'

import { AppLayout } from '@/components/layout/app-layout'
import { CategoriesPage } from '@/pages/categories-page'
import { ProductDetailPage } from '@/pages/product-detail-page'
import { ProductsPage } from '@/pages/products-page'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/produtos" replace />} />
        <Route path="produtos" element={<ProductsPage />} />
        <Route path="produtos/:id" element={<ProductDetailPage />} />
        <Route path="categorias" element={<CategoriesPage />} />
      </Route>
    </Routes>
  )
}

export default App
