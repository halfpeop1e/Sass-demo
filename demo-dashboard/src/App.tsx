import { Routes, Route } from "react-router-dom";
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
  );
}

export default App;
