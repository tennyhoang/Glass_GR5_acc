import { Routes, Route, useLocation } from "react-router-dom";
import NavBar from "./components/layout/NavBar";
import ProtectedRoute from "./routes/ProtectedRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SalesDashboard from "./pages/SalesDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerProfile from "./pages/CustomerProfile";
import OrderHistory from "./pages/OrderHistory";
import ReturnRequest from "./pages/ReturnRequest";

function App() {
  const location = useLocation();

  // Không hiển thị NavBar ở trang login
  const hideNavBarRoutes = ["/login"];
  const showNavBar = !hideNavBarRoutes.includes(location.pathname);

  return (
    <>
      {showNavBar && <NavBar />}

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<CustomerProfile />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/returns" element={<ReturnRequest />} />

        {/* SALES ONLY */}
        <Route
          path="/sales"
          element={
            <ProtectedRoute allowRoles={["SALES"]}>
              <SalesDashboard />
            </ProtectedRoute>
          }
        />

        {/* ADMIN ONLY */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
