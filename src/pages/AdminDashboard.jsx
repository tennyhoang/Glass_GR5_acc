import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";
import glassesList from "../data/GlassesList";
import mockUsers from "../data/mockUsers";
import AdminProductCard from "../components/admin/AdminProductCard";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("BUSINESS_RULES");
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState("CUSTOMER");

  const navigate = useNavigate();

  /* ================= PRODUCTS ================= */
  useEffect(() => {
    const stored = localStorage.getItem("admin_products");
    if (stored) {
      setProducts(JSON.parse(stored));
    } else {
      setProducts(glassesList);
      localStorage.setItem("admin_products", JSON.stringify(glassesList));
    }
  }, []);

  const handleSaveProduct = (updatedProduct) => {
    const updatedList = products.map((p) =>
      p.id === updatedProduct.id ? updatedProduct : p
    );
    setProducts(updatedList);
    localStorage.setItem("admin_products", JSON.stringify(updatedList));
  };

  /* ================= USERS ================= */
  useEffect(() => {
    const stored = localStorage.getItem("admin_users");
    if (stored) {
      setUsers(JSON.parse(stored));
    } else {
      setUsers(mockUsers);
      localStorage.setItem("admin_users", JSON.stringify(mockUsers));
    }
  }, []);

  const filteredUsers =
    userFilter === "CUSTOMER"
      ? users.filter((u) => u.role === "CUSTOMER")
      : users.filter((u) => u.role === "SALES" || u.role === "OPERATION");

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const renderContent = () => {
    switch (activeSection) {
      case "BUSINESS_RULES":
        return <h2>Business Rules & Policies Management</h2>;

      case "PRODUCT_CONFIG":
        return (
          <>
            <h2>Product Configuration Management</h2>
            <div className="glasses-grid">
              {products.map((product) => (
                <AdminProductCard
                  key={product.id}
                  product={product}
                  onSave={handleSaveProduct}
                />
              ))}
            </div>
          </>
        );

      case "USER_MANAGEMENT":
        return (
          <>
            <h2>User & Staff Management</h2>

            {/* FILTER BUTTONS */}
            <div style={{ marginBottom: "20px" }}>
              <button
                onClick={() => setUserFilter("CUSTOMER")}
                className={userFilter === "CUSTOMER" ? "active" : ""}
              >
                Customers
              </button>

              <button
                onClick={() => setUserFilter("STAFF")}
                className={userFilter === "STAFF" ? "active" : ""}
                style={{ marginLeft: "10px" }}
              >
                Staff
              </button>
            </div>

            {/* USER LIST */}
            <table width="100%" cellPadding="10" border="1">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Username</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Create Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <img
                        src={u.avatar}
                        alt={u.username}
                        width="40"
                        style={{ borderRadius: "50%" }}
                      />
                    </td>
                    <td>{u.username}</td>
                    <td>{u.name}</td>
                    <td>{u.role}</td>
                    <td>{u.createDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        );

      case "PRICING":
        return <h2>Pricing, Combo & Promotion Management</h2>;

      case "REVENUE":
        return <h2>Revenue Management</h2>;

      default:
        return <h2>Admin Dashboard</h2>;
    }
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <h3 className="sidebar-title">Admin Panel</h3>

        <button onClick={() => navigate("/")}>HomePage</button>

        <button
          className={activeSection === "BUSINESS_RULES" ? "active" : ""}
          onClick={() => setActiveSection("BUSINESS_RULES")}
        >
          Business Rules
        </button>

        <button
          className={activeSection === "PRODUCT_CONFIG" ? "active" : ""}
          onClick={() => setActiveSection("PRODUCT_CONFIG")}
        >
          Product Configuration
        </button>

        <button
          className={activeSection === "USER_MANAGEMENT" ? "active" : ""}
          onClick={() => setActiveSection("USER_MANAGEMENT")}
        >
          User Management
        </button>

        <button
          className={activeSection === "REVENUE" ? "active" : ""}
          onClick={() => setActiveSection("REVENUE")}
        >
          Revenue
        </button>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="admin-content">{renderContent()}</main>
    </div>
  );
}
