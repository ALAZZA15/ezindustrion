import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import OwnerLayout from "@/components/OwnerLayout";
import RequireRole from "@/components/RequireRole";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Dashboard from "@/pages/owner/Dashboard";
import Rooms from "@/pages/owner/Rooms";
import Tenants from "@/pages/owner/Tenants";
import ComingSoon from "@/pages/owner/ComingSoon";
import TenantHome from "@/pages/tenant/TenantHome";
import { t } from "@/i18n";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/owner"
          element={
            <RequireRole role="owner">
              <OwnerLayout />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="tenants" element={<Tenants />} />
          <Route path="bills" element={<ComingSoon title={t.nav.bills} />} />
          <Route path="bookings" element={<ComingSoon title={t.nav.bookings} />} />
          <Route path="complaints" element={<ComingSoon title={t.nav.complaints} />} />
          <Route path="finances" element={<ComingSoon title={t.nav.finances} />} />
          <Route path="contracts" element={<ComingSoon title={t.nav.contracts} />} />
        </Route>
        <Route
          path="/tenant"
          element={
            <RequireRole role="tenant">
              <TenantHome />
            </RequireRole>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster richColors />
    </>
  );
}