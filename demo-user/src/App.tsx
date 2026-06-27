import { Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import BuyerLayout from './layouts/BuyerLayout';
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ShopListPage from './pages/ShopListPage';
import ShopDetailPage from './pages/ShopDetailPage';
import CartPage from './pages/CartPage';
import OrderListPage from './pages/OrderListPage';

function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1890ff', borderRadius: 6 } }}>
      <AntApp>
        <Routes>
          <Route path="/" element={<BuyerLayout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductListPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="shops" element={<ShopListPage />} />
            <Route path="shops/:id" element={<ShopDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="orders" element={<OrderListPage />} />
          </Route>
        </Routes>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
