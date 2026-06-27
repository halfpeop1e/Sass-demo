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
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontFamilyCode: "'SF Mono', 'Fira Code', monospace",
          colorPrimary: "#0284c7",
          colorSuccess: "#059669",
          colorWarning: "#d97706",
          colorError: "#dc2626",
          colorInfo: "#0284c7",
          colorBgBase: "#ffffff",
          colorBgContainer: "#ffffff",
          colorBorder: "#e5e7eb",
          colorText: "#1f2937",
          colorTextSecondary: "#6b7280",
          colorTextTertiary: "#9ca3af",
          borderRadius: 10,
          borderRadiusLG: 14,
          borderRadiusSM: 6,
          controlHeight: 40,
          fontSize: 14,
          fontSizeHeading1: 32,
          fontSizeHeading2: 26,
          fontSizeHeading3: 22,
          fontSizeHeading4: 18,
          fontSizeHeading5: 15,
          lineHeight: 1.65,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          boxShadowSecondary: "0 4px 16px rgba(0,0,0,0.05)",
        },
        components: {
          Card: {
            borderRadiusLG: 14,
            paddingLG: 24,
            colorBorderSecondary: "#f3f4f6",
          },
          Button: {
            borderRadius: 10,
            controlHeight: 40,
            primaryShadow: "0 2px 8px rgba(2,132,199,0.25)",
          },
          Tag: {
            borderRadiusSM: 6,
          },
          Input: {
            controlHeight: 40,
            borderRadius: 10,
          },
          Menu: {
            horizontalItemHoverColor: "#0284c7",
            horizontalItemSelectedColor: "#0284c7",
          },
          Statistic: {
            contentFontSize: 28,
            titleFontSize: 13,
          },
          Table: {
            headerBg: "#f9fafb",
            headerColor: "#6b7280",
            rowHoverBg: "rgba(2,132,199,0.02)",
            borderColor: "#f3f4f6",
          },
          Badge: {
            colorText: "#1f2937",
          },
        },
      }}
    >
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
