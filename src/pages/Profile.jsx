import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../services/authService";
import api from "../services/api";

export default function Profile() {
  const navigate = useNavigate();
  const user = getUser();
  const [tab, setTab] = useState("INFO");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

  if (!user) { navigate("/login"); return null; }

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      await api.put("/customer/profile", form);
      const newUser = { ...user, ...form };
      localStorage.setItem("user", JSON.stringify(newUser));
      alert("✅ Cập nhật thành công!");
      setEditMode(false);
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.oldPassword || !pwForm.newPassword) { alert("Vui lòng nhập đầy đủ!"); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { alert("Mật khẩu xác nhận không khớp!"); return; }
    setSaving(true);
    try {
      await api.put("/customer/change-password", {
        oldPassword: pwForm.oldPassword,
        newPassword: pwForm.newPassword,
      });
      alert("✅ Đổi mật khẩu thành công!");
      setPwForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <div style={S.navLogo} onClick={() => navigate("/")}>👓 GlassesShop</div>
        <div style={S.navRight}>
          <button style={S.navBtn} onClick={() => navigate("/")}>🏠 Trang chủ</button>
          <button style={S.navBtn} onClick={() => navigate("/orders")}>📦 Đơn hàng</button>
          <button style={S.navLogoutBtn} onClick={handleLogout}>Đăng xuất</button>
        </div>
      </nav>

      <div style={S.container}>
        <div style={S.layout}>
          {/* SIDEBAR */}
          <div style={S.sidebar}>
            <div style={S.avatar}>
              {(user?.name || user?.username || "U").charAt(0).toUpperCase()}
            </div>
            <p style={S.userName}>{user?.name || user?.username}</p>
            <p style={S.userRole}>
              {user?.role === "USER" ? "Khách hàng" : user?.role}
            </p>
            <div style={S.sideMenu}>
              {[
                { key: "INFO", label: "👤 Thông tin cá nhân" },
                { key: "PASSWORD", label: "🔒 Đổi mật khẩu" },
                { key: "QUICK", label: "🔗 Truy cập nhanh" },
              ].map((m) => (
                <button key={m.key}
                  style={{ ...S.sideBtn, ...(tab === m.key ? S.sideBtnActive : {}) }}
                  onClick={() => setTab(m.key)}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* CONTENT */}
          <div style={S.content}>
            {/* THÔNG TIN */}
            {tab === "INFO" && (
              <div style={S.card}>
                <div style={S.cardHeader}>
                  <h3 style={S.cardTitle}>Thông tin cá nhân</h3>
                  {!editMode && (
                    <button style={S.btnEdit} onClick={() => setEditMode(true)}>✏️ Chỉnh sửa</button>
                  )}
                </div>
                <div style={S.formGrid}>
                  <div style={S.field}>
                    <label style={S.label}>Tên đăng nhập</label>
                    <input style={{ ...S.input, background: "#f5f5f5" }}
                      value={user?.username || ""} disabled />
                  </div>
                  <div style={S.field}>
                    <label style={S.label}>Email</label>
                    <input style={{ ...S.input, background: "#f5f5f5" }}
                      value={user?.email || ""} disabled />
                  </div>
                  <div style={S.field}>
                    <label style={S.label}>Họ và tên</label>
                    <input style={{ ...S.input, background: editMode ? "white" : "#f5f5f5" }}
                      value={form.name} disabled={!editMode}
                      onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div style={S.field}>
                    <label style={S.label}>Số điện thoại</label>
                    <input style={{ ...S.input, background: editMode ? "white" : "#f5f5f5" }}
                      value={form.phone} disabled={!editMode}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div style={{ ...S.field, gridColumn: "1/-1" }}>
                    <label style={S.label}>Địa chỉ</label>
                    <input style={{ ...S.input, background: editMode ? "white" : "#f5f5f5" }}
                      value={form.address} disabled={!editMode}
                      onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  </div>
                </div>
                {editMode && (
                  <div style={S.btnRow}>
                    <button style={S.btnSave} onClick={handleUpdateProfile} disabled={saving}>
                      {saving ? "Đang lưu..." : "💾 Lưu thay đổi"}
                    </button>
                    <button style={S.btnCancel} onClick={() => setEditMode(false)}>Hủy</button>
                  </div>
                )}
              </div>
            )}

            {/* ĐỔI MẬT KHẨU */}
            {tab === "PASSWORD" && (
              <div style={S.card}>
                <h3 style={S.cardTitle}>Đổi mật khẩu</h3>
                <div style={{ maxWidth: 400 }}>
                  {[
                    { key: "oldPassword", label: "Mật khẩu hiện tại" },
                    { key: "newPassword", label: "Mật khẩu mới" },
                    { key: "confirmPassword", label: "Xác nhận mật khẩu mới" },
                  ].map((f) => (
                    <div style={S.field} key={f.key}>
                      <label style={S.label}>{f.label}</label>
                      <input style={S.input} type="password"
                        value={pwForm[f.key]}
                        onChange={(e) => setPwForm({ ...pwForm, [f.key]: e.target.value })} />
                    </div>
                  ))}
                  <button style={S.btnSave} onClick={handleChangePassword} disabled={saving}>
                    {saving ? "Đang đổi..." : "🔒 Đổi mật khẩu"}
                  </button>
                </div>
              </div>
            )}

            {/* TRUY CẬP NHANH */}
            {tab === "QUICK" && (
              <div style={S.card}>
                <h3 style={S.cardTitle}>Truy cập nhanh</h3>
                <div style={S.quickGrid}>
                  {[
                    { icon: "📦", label: "Đơn hàng của tôi", sub: "Xem lịch sử đơn hàng", path: "/orders" },
                    { icon: "🛒", label: "Giỏ hàng", sub: "Xem sản phẩm trong giỏ", path: "/cart" },
                    { icon: "🎨", label: "Thiết kế kính", sub: "Tạo kính theo yêu cầu", path: "/design-glasses" },
                    { icon: "👁️", label: "Hồ sơ mắt", sub: "Quản lý hồ sơ đo mắt", path: "/eye-profile" },
                  ].map((q) => (
                    <div key={q.path} style={S.quickCard} onClick={() => navigate(q.path)}>
                      <div style={S.quickIcon}>{q.icon}</div>
                      <h4 style={S.quickLabel}>{q.label}</h4>
                      <p style={S.quickSub}>{q.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", background: "#f5f5f5", fontFamily: "system-ui, sans-serif" },
  nav: {
    background: "#ee4d2d", height: 56, padding: "0 16px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    position: "sticky", top: 0, zIndex: 100,
  },
  navLogo: { fontSize: 20, fontWeight: 800, color: "white", cursor: "pointer" },
  navRight: { display: "flex", gap: 8, alignItems: "center" },
  navBtn: { background: "transparent", border: "none", color: "white", fontSize: 13, cursor: "pointer" },
  navLogoutBtn: { background: "rgba(0,0,0,0.15)", border: "none", borderRadius: 4, color: "white", padding: "6px 12px", fontSize: 13, cursor: "pointer" },
  container: { maxWidth: 1000, margin: "0 auto", padding: "24px 16px" },
  layout: { display: "grid", gridTemplateColumns: "240px 1fr", gap: 20 },
  sidebar: {
    background: "white", borderRadius: 6, padding: 20,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)", textAlign: "center",
  },
  avatar: {
    width: 72, height: 72, borderRadius: "50%",
    background: "#ee4d2d", color: "white",
    fontSize: 28, fontWeight: 700, margin: "0 auto 12px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  userName: { fontWeight: 700, fontSize: 16, marginBottom: 4 },
  userRole: { color: "#888", fontSize: 13, marginBottom: 20 },
  sideMenu: { display: "flex", flexDirection: "column", gap: 4 },
  sideBtn: {
    padding: "10px 14px", border: "none", background: "transparent",
    borderRadius: 4, fontSize: 14, cursor: "pointer", textAlign: "left",
    color: "#444",
  },
  sideBtnActive: { background: "#fff5f5", color: "#ee4d2d", fontWeight: 600 },
  content: {},
  card: {
    background: "white", borderRadius: 6, padding: 24,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  cardTitle: { fontSize: 18, fontWeight: 700, margin: 0 },
  btnEdit: {
    padding: "8px 16px", background: "#fff5f5", color: "#ee4d2d",
    border: "1px solid #ee4d2d", borderRadius: 4, fontSize: 13, cursor: "pointer",
  },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#555" },
  input: {
    padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4,
    fontSize: 14, outline: "none",
  },
  btnRow: { display: "flex", gap: 10, marginTop: 20 },
  btnSave: {
    padding: "10px 24px", background: "#ee4d2d", color: "white",
    border: "none", borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  btnCancel: {
    padding: "10px 20px", background: "#f5f5f5", color: "#444",
    border: "1px solid #ddd", borderRadius: 4, fontSize: 14, cursor: "pointer",
  },
  quickGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8 },
  quickCard: {
    border: "1px solid #eee", borderRadius: 6, padding: 20,
    cursor: "pointer", transition: "all 0.2s",
    ":hover": { border: "1px solid #ee4d2d" },
  },
  quickIcon: { fontSize: 32, marginBottom: 10 },
  quickLabel: { fontSize: 14, fontWeight: 600, marginBottom: 4 },
  quickSub: { fontSize: 12, color: "#888" },
};