import { Routes, Route } from "react-router-dom";
import { ConfigProvider, App as AntApp } from "antd";
import MerchantLayout from "./layouts/MerchantLayout";
import MerchantDashboard from "./pages/MerchantDashboard";
import ShopManagement from "./pages/ShopManagement";
import ProductManagement from "./pages/ProductManagement";
import OrderManagement from "./pages/OrderManagement";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily:
            "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontFamilyCode: "'SF Mono', 'Fira Code', monospace",
          colorPrimary: "#6366f1",
          colorSuccess: "#10b981",
          colorWarning: "#f59e0b",
          colorError: "#ef4444",
          colorInfo: "#6366f1",
          colorBgBase: "#ffffff",
          colorBgContainer: "#ffffff",
          colorBgElevated: "#ffffff",
          colorBorder: "#e5e7eb",
          colorText: "#111827",
          colorTextSecondary: "#6b7280",
          colorTextTertiary: "#9ca3af",
          borderRadius: 8,
          borderRadiusLG: 12,
          borderRadiusSM: 6,
          controlHeight: 38,
          fontSize: 14,
          fontSizeHeading1: 30,
          fontSizeHeading2: 24,
          fontSizeHeading3: 20,
          fontSizeHeading4: 17,
          fontSizeHeading5: 15,
          lineHeight: 1.6,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          boxShadowSecondary: "0 4px 16px rgba(0,0,0,0.06)",
        },
        components: {
          Card: {
            borderRadiusLG: 12,
            paddingLG: 20,
            colorBorderSecondary: "#f3f4f6",
          },
          Menu: {
            darkItemBg: "transparent",
            darkItemColor: "#9ca3af",
            darkItemHoverBg: "rgba(99,102,241,0.08)",
            darkItemHoverColor: "#f9fafb",
            darkItemSelectedBg: "rgba(99,102,241,0.12)",
            darkItemSelectedColor: "#a5b4fc",
            itemBorderRadius: 8,
          },
          Table: {
            headerBg: "#f9fafb",
            headerColor: "#6b7280",
            rowHoverBg: "rgba(99,102,241,0.03)",
            borderColor: "#f3f4f6",
          },
          Tag: {
            defaultBg: "rgba(107,114,128,0.06)",
            defaultColor: "#6b7280",
          },
          Statistic: {
            contentFontSize: 26,
            titleFontSize: 13,
          },
          Button: {
            borderRadius: 8,
            controlHeight: 36,
          },
          Layout: {
            bodyBg: "#f9fafb",
            headerBg: "#ffffff",
            siderBg: "#111827",
            triggerBg: "#1f2937",
            triggerColor: "#9ca3af",
          },
          Alert: {
            colorInfoBg: "rgba(99,102,241,0.06)",
            colorInfoBorder: "rgba(99,102,241,0.15)",
            colorSuccessBg: "rgba(16,185,129,0.06)",
            colorSuccessBorder: "rgba(16,185,129,0.15)",
            colorWarningBg: "rgba(245,158,11,0.06)",
            colorWarningBorder: "rgba(245,158,11,0.15)",
            colorErrorBg: "rgba(239,68,68,0.06)",
            colorErrorBorder: "rgba(239,68,68,0.15)",
          },
        },
      }}
    >
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
