import { Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import MerchantLayout from './layouts/MerchantLayout';
import MerchantDashboard from './pages/MerchantDashboard';
import ShopManagement from './pages/ShopManagement';
import ProductManagement from './pages/ProductManagement';
import OrderManagement from './pages/OrderManagement';

function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1890ff', borderRadius: 6 } }}>
      <AntApp>
        <Routes>
          <Route path="/" element={<MerchantLayout />}>
            <Route index element={<MerchantDashboard />} />
            <Route path="shop" element={<ShopManagement />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="orders" element={<OrderManagement />} />
          </Route>
        </Routes>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
