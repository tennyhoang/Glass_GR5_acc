import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/authService";
import { useToast } from "../components/Toast";

export default function Register() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "", name: "", email: "", phone: "", address: "" });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async () => {
    if (!form.username || !form.password || !form.name || !form.email) { setError("Vui long nhap day du thong tin bat buoc!"); return; }
    if (form.password !== form.confirmPassword) { setError("Mat khau xac nhan khong khop!"); return; }
    setLoading(true); setError("");
    try {
      await register({ username: form.username, password: form.password, name: form.name, email: form.email, phone: form.phone, address: form.address });
      toast({ message: "Dang ky thanh cong! Vui long dang nhap.", type: "success" });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Dang ky that bai!");
    } finally { setLoading(false); }
  };

  const fields = [
    { name: "username", label: "Ten dang nhap *", type: "text", placeholder: "Nhap username..." },
    { name: "password", label: "Mat khau *", type: "password", placeholder: "Nhap mat khau..." },
    { name: "confirmPassword", label: "Xac nhan mat khau *", type: "password", placeholder: "Nhap lai mat khau..." },
    { name: "name", label: "Ho va ten *", type: "text", placeholder: "Nhap ho ten..." },
    { name: "email", label: "Email *", type: "email", placeholder: "Nhap email..." },
    { name: "phone", label: "So dien thoai", type: "text", placeholder: "Nhap SDT..." },
    { name: "address", label: "Dia chi", type: "text", placeholder: "Nhap dia chi..." },
  ];

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>👓</div>
        <h2 style={S.title}>Dang ky tai khoan</h2>
        <p style={S.sub}>Tao tai khoan GlassesShop cua ban</p>
        {error && <div style={S.error}>{error}</div>}
        {fields.map(f => (
          <div style={S.formGroup} key={f.name}>
            <label style={S.label}>{f.label}</label>
            <input style={S.input} type={f.type} name={f.name}
              placeholder={f.placeholder} value={form[f.name]} onChange={handleChange} />
          </div>
        ))}
        <button style={{ ...S.btn, opacity: loading ? 0.7 : 1 }} onClick={handleRegister} disabled={loading}>
          {loading ? "Dang dang ky..." : "Dang ky"}
        </button>
        <p style={S.footer}>
          Da co tai khoan? <Link to="/login" style={S.link}>Dang nhap</Link>
        </p>
      </div>
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #ee4d2d 0%, #ff7043 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 0" },
  card: { background: "white", borderRadius: 16, padding: "40px 36px", width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", textAlign: "center" },
  title: { fontSize: 24, fontWeight: 700, margin: "0 0 4px" },
  sub: { color: "#666", fontSize: 14, marginBottom: 24 },
  error: { background: "#fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: 8, fontSize: 14, marginBottom: 16, textAlign: "left" },
  formGroup: { marginBottom: 14, textAlign: "left" },
  label: { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 },
  input: { width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" },
  btn: { width: "100%", padding: "12px", background: "linear-gradient(135deg, #ee4d2d, #ff7043)", color: "white", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer", marginTop: 8 },
  footer: { marginTop: 20, fontSize: 14, color: "#666" },
  link: { color: "#ee4d2d", fontWeight: 600, textDecoration: "none" },
};