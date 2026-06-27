import { Routes, Route } from "react-router-dom";
import { ConfigProvider, App as AntApp } from "antd";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import TenantManagement from "./pages/TenantManagement";
import MicroserviceTopo from "./pages/MicroserviceTopo";
import SystemMonitor from "./pages/SystemMonitor";
import ScalingDisaster from "./pages/ScalingDisaster";
import PaymentLogistics from "./pages/PaymentLogistics";
import SystemLimits from "./pages/SystemLimits";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontFamilyCode: "'SF Mono', 'Fira Code', monospace",
          colorPrimary: "#38bdf8",
          colorSuccess: "#34d399",
          colorWarning: "#fbbf24",
          colorError: "#f87171",
          colorInfo: "#38bdf8",
          colorBgBase: "#0b1120",
          colorBgContainer: "#111827",
          colorBgElevated: "#1a2332",
          colorBorder: "#1e2d3d",
          colorText: "#e2e8f0",
          colorTextSecondary: "#94a3b8",
          colorTextTertiary: "#64748b",
          borderRadius: 8,
          borderRadiusLG: 12,
          borderRadiusSM: 6,
          controlHeight: 36,
          fontSize: 14,
          fontSizeHeading1: 30,
          fontSizeHeading2: 24,
          fontSizeHeading3: 20,
          fontSizeHeading4: 17,
          fontSizeHeading5: 15,
          lineHeight: 1.6,
          boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
          boxShadowSecondary: "0 4px 12px rgba(0,0,0,0.4)",
        },
        components: {
          Card: {
            colorBgContainer: "#111827",
            colorBorderSecondary: "#1e2d3d",
            borderRadiusLG: 12,
            paddingLG: 20,
          },
          Menu: {
            darkItemBg: "transparent",
            darkItemColor: "#94a3b8",
            darkItemHoverBg: "rgba(56,189,248,0.08)",
            darkItemHoverColor: "#e2e8f0",
            darkItemSelectedBg: "rgba(56,189,248,0.12)",
            darkItemSelectedColor: "#38bdf8",
            itemBorderRadius: 8,
          },
          Table: {
            headerBg: "#0f172a",
            headerColor: "#94a3b8",
            rowHoverBg: "rgba(56,189,248,0.04)",
            borderColor: "#1e2d3d",
          },
          Tag: {
            defaultBg: "rgba(148,163,184,0.1)",
            defaultColor: "#94a3b8",
          },
          Statistic: {
            contentFontSize: 28,
            titleFontSize: 13,
          },
          Badge: {
            colorText: "#e2e8f0",
          },
          Progress: {
            defaultColor: "#38bdf8",
            remainingColor: "rgba(30,45,61,0.6)",
          },
          Button: {
            borderRadius: 8,
            controlHeight: 36,
          },
          Tabs: {
            colorText: "#94a3b8",
          },
          Alert: {
            colorInfoBg: "rgba(56,189,248,0.08)",
            colorInfoBorder: "rgba(56,189,248,0.2)",
            colorSuccessBg: "rgba(52,211,153,0.08)",
            colorSuccessBorder: "rgba(52,211,153,0.2)",
            colorWarningBg: "rgba(251,191,36,0.08)",
            colorWarningBorder: "rgba(251,191,36,0.2)",
            colorErrorBg: "rgba(248,113,113,0.08)",
            colorErrorBorder: "rgba(248,113,113,0.2)",
          },
          Layout: {
            bodyBg: "#0b1120",
            headerBg: "#0f172a",
            siderBg: "#0a0f1a",
            triggerBg: "#0f172a",
            triggerColor: "#94a3b8",
          },
        },
      }}
    >
      <AntApp>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="tenants" element={<TenantManagement />} />
            <Route path="microservices" element={<MicroserviceTopo />} />
            <Route path="monitor" element={<SystemMonitor />} />
            <Route path="scaling" element={<ScalingDisaster />} />
            <Route path="payment-logistics" element={<PaymentLogistics />} />
            <Route path="limits" element={<SystemLimits />} />
          </Route>
        </Routes>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
