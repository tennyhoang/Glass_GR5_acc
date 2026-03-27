import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";
import { useToast } from "../components/Toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async () => {
    if (!username || !password) { setError("Vui long nhap day du thong tin!"); return; }
    setLoading(true); setError("");
    try {
      const user = await login(username, password);
      toast({ message: "Dang nhap thanh cong! Xin chao " + (user?.name || user?.username), type: "success" });
      if (user.role === "ADMIN") navigate("/admin");
      else if (user.role === "STAFF") navigate("/staff");
      else if (user.role === "OPERATION") navigate("/operation");
      else if (user.role === "SHIPPER") navigate("/shipper");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Sai tai khoan hoac mat khau!");
    } finally { setLoading(false); }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>👓</div>
        <h2 style={S.title}>GlassesShop</h2>
        <p style={S.sub}>Dang nhap vao tai khoan cua ban</p>
        {error && <div style={S.error}>{error}</div>}
        <div style={S.formGroup}>
          <label style={S.label}>Ten dang nhap</label>
          <input style={S.input} placeholder="Nhap username..."
            value={username} onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Mat khau</label>
          <input style={S.input} type="password" placeholder="Nhap mat khau..."
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()} />
        </div>
        <button style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}
          onClick={handleLogin} disabled={loading}>
          {loading ? "Dang dang nhap..." : "Dang nhap"}
        </button>
        <p style={S.footer}>
          Chua co tai khoan? <Link to="/register" style={S.link}>Dang ky ngay</Link>
        </p>
      </div>
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #ee4d2d 0%, #ff7043 100%)", display: "flex", alignItems: "center", justifyContent: "center" },
  card: { background: "white", borderRadius: 16, padding: "40px 36px", width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", textAlign: "center" },
  title: { fontSize: 24, fontWeight: 700, margin: "0 0 4px" },
  sub: { color: "#666", fontSize: 14, marginBottom: 24 },
  error: { background: "#fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: 8, fontSize: 14, marginBottom: 16, textAlign: "left" },
  formGroup: { marginBottom: 16, textAlign: "left" },
  label: { display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 },
  input: { width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" },
  btn: { width: "100%", padding: "12px", background: "linear-gradient(135deg, #ee4d2d, #ff7043)", color: "white", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer", marginTop: 8 },
  footer: { marginTop: 20, fontSize: 14, color: "#666" },
  link: { color: "#ee4d2d", fontWeight: 600, textDecoration: "none" },
};