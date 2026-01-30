import { Routes, Route, useLocation } from "react-router-dom";
import NavBar from "./components/layout/NavBar";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";

import SalesDashboard from "./pages/SalesDashboard";
import OperationDashboard from "./pages/OperationDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const location = useLocation();

  // Chỉ hiện NavBar ở HomePage
  const showNavBar = location.pathname === "/";

  return (
    <>
      {showNavBar && <NavBar />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/sales" element={<SalesDashboard />} />
        <Route path="/operation" element={<OperationDashboard />} />
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </>
  );
}

export default App;
