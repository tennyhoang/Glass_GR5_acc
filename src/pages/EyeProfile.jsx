import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../services/authService";
import api from "../services/api";

export default function EyeProfile() {
  const navigate = useNavigate();
  const user = getUser();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    profileName: "",
    rightEye: { eyeSide: "RIGHT", sph: "", cyl: "", axis: "", pd: "", add: "" },
    leftEye: { eyeSide: "LEFT", sph: "", cyl: "", axis: "", pd: "", add: "" },
  });

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/eye-profiles/me");
      setProfiles(Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleEyeChange = (side, field, value) => {
    setForm(prev => ({ ...prev, [side]: { ...prev[side], [field]: value } }));
  };

  const resetForm = () => setForm({
    profileName: "",
    rightEye: { eyeSide: "RIGHT", sph: "", cyl: "", axis: "", pd: "", add: "" },
    leftEye: { eyeSide: "LEFT", sph: "", cyl: "", axis: "", pd: "", add: "" },
  });

  const handleSubmit = async () => {
    if (!form.profileName.trim()) { alert("Vui long nhap ten ho so!"); return; }
    setSaving(true);
    try {
      await api.post("/api/eye-profiles/manual", {
        profileName: form.profileName,
        rightEye: {
          eyeSide: "RIGHT",
          sph: parseFloat(form.rightEye.sph) || 0,
          cyl: parseFloat(form.rightEye.cyl) || 0,
          axis: parseInt(form.rightEye.axis) || 0,
          pd: parseFloat(form.rightEye.pd) || 62,
          add: parseFloat(form.rightEye.add) || 0,
        },
        leftEye: {
          eyeSide: "LEFT",
          sph: parseFloat(form.leftEye.sph) || 0,
          cyl: parseFloat(form.leftEye.cyl) || 0,
          axis: parseInt(form.leftEye.axis) || 0,
          pd: parseFloat(form.leftEye.pd) || 62,
          add: parseFloat(form.leftEye.add) || 0,
        },
      });
      alert("Tao ho so mat thanh cong!");
      setShowForm(false);
      resetForm();
      fetchProfiles();
    } catch (e) { alert("Loi: " + (e.response?.data?.message || e.message)); }
    finally { setSaving(false); }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Vo hieu hoa ho so nay?")) return;
    try {
      await api.patch(`/api/eye-profiles/${id}/deactivate`);
      fetchProfiles();
    } catch (e) { alert("Loi: " + (e.response?.data?.message || e.message)); }
  };

  const EYE_FIELDS = [
    { key: "sph", label: "SPH (Do cau)", placeholder: "VD: -2.50" },
    { key: "cyl", label: "CYL (Do tru)", placeholder: "VD: -0.75" },
    { key: "axis", label: "Axis (Truc)", placeholder: "0 - 180" },
    { key: "pd", label: "PD (mm)", placeholder: "VD: 62" },
    { key: "add", label: "ADD", placeholder: "VD: 1.00" },
  ];

  return (
    <div style={S.page}>
      {/* NAV */}
      <nav style={S.nav}>
        <div style={S.navInner}>
          <div style={S.logo} onClick={() => navigate("/")}>👓 GlassesShop</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button style={S.navBtn} onClick={() => navigate("/")}>Trang chu</button>
            <button style={S.navBtn} onClick={() => navigate("/design-glasses")}>Thiet ke kinh</button>
            <button style={S.navBtnUser} onClick={() => navigate("/profile")}>{user?.name?.split(" ").pop() || user?.username}</button>
          </div>
        </div>
      </nav>

      <div style={S.container}>
        {/* HEADER */}
        <div style={S.pageHeader}>
          <div>
            <h1 style={S.pageTitle}>Ho So Mat</h1>
            <p style={S.pageSub}>Quan ly thong tin do mat de thiet ke kinh chinh xac</p>
          </div>
          <button style={S.btnAdd} onClick={() => setShowForm(!showForm)}>
            {showForm ? "Dong" : "+ Tao ho so moi"}
          </button>
        </div>

        {/* FORM TẠO HỒ SƠ */}
        {showForm && (
          <div style={S.formCard}>
            <h3 style={S.formTitle}>Tao Ho So Mat Moi</h3>

            <div style={S.field}>
              <label style={S.label}>Ten ho so *</label>
              <input style={S.input}
                placeholder="VD: Don thuoc thang 3/2026"
                value={form.profileName}
                onChange={e => setForm({ ...form, profileName: e.target.value })} />
            </div>

            <div style={S.eyeGrid}>
              {[
                { side: "rightEye", label: "Mat Phai (OD)" },
                { side: "leftEye", label: "Mat Trai (OS)" },
              ].map(({ side, label }) => (
                <div key={side} style={S.eyeSection}>
                  <div style={S.eyeHeader}>
                    <span style={S.eyeDot} />
                    <h4 style={S.eyeTitle}>{label}</h4>
                  </div>
                  {EYE_FIELDS.map(f => (
                    <div key={f.key} style={S.fieldRow}>
                      <label style={S.fieldLabel}>{f.label}</label>
                      <input style={S.fieldInput}
                        type="number" step="0.25"
                        placeholder={f.placeholder}
                        value={form[side][f.key]}
                        onChange={e => handleEyeChange(side, f.key, e.target.value)} />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div style={S.formActions}>
              <button style={S.btnSave} onClick={handleSubmit} disabled={saving}>
                {saving ? "Dang luu..." : "Luu Ho So Mat"}
              </button>
              <button style={S.btnCancel} onClick={() => { setShowForm(false); resetForm(); }}>Huy</button>
            </div>
          </div>
        )}

        {/* DANH SÁCH HỒ SƠ */}
        {loading ? <Spinner /> : profiles.length === 0 ? (
          <div style={S.empty}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>👁️</div>
            <h3 style={{ fontWeight: 600, color: "#555", marginBottom: 8 }}>Chua co ho so mat nao</h3>
            <p style={{ color: "#aaa", marginBottom: 20 }}>Tao ho so mat de thiet ke kinh theo dung do cua ban</p>
            <button style={S.btnAdd} onClick={() => setShowForm(true)}>+ Tao ho so dau tien</button>
          </div>
        ) : (
          <div style={S.profileList}>
            {profiles.map(p => (
              <div key={p.eyeProfileId} style={S.profileCard}>
                <div style={S.profileTop}>
                  <div style={S.profileInfo}>
                    <div style={S.profileIcon}>👁️</div>
                    <div>
                      <h3 style={S.profileName}>{p.profileName}</h3>
                      <p style={S.profileMeta}>
                        {p.source === "MANUAL" ? "Nhap tay" : "Upload file"} •{" "}
                        {p.createdDate ? new Date(p.createdDate).toLocaleDateString("vi-VN") : ""}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ ...S.badge, ...(p.status === "ACTIVE" ? S.badgeGreen : S.badgeGray) }}>
                      {p.status === "ACTIVE" ? "Dang dung" : "Vo hieu"}
                    </span>
                    {p.status === "ACTIVE" && (
                      <button style={S.btnOutline} onClick={() => handleDeactivate(p.eyeProfileId)}>
                        Vo hieu hoa
                      </button>
                    )}
                    {p.status === "ACTIVE" && (
                      <button style={S.btnPrimary}
                        onClick={() => navigate("/design-glasses", { state: { eyeProfileId: p.eyeProfileId } })}>
                        Thiet ke ngay
                      </button>
                    )}
                  </div>
                </div>

                {/* PRESCRIPTION TABLE */}
                {p.prescriptions?.length > 0 && (
                  <div style={S.rxTable}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#f9fafb" }}>
                          <th style={S.th}>Mat</th>
                          <th style={S.th}>SPH</th>
                          <th style={S.th}>CYL</th>
                          <th style={S.th}>Axis</th>
                          <th style={S.th}>PD</th>
                          <th style={S.th}>ADD</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.prescriptions.map(rx => (
                          <tr key={rx.prescriptionId} style={{ borderBottom: "1px solid #f0f0f0" }}>
                            <td style={{ ...S.td, fontWeight: 600, color: rx.eyeSide === "RIGHT" ? "#3b82f6" : "#8b5cf6" }}>
                              {rx.eyeSide === "RIGHT" ? "Mat Phai" : "Mat Trai"}
                            </td>
                            {["sph", "cyl", "axis", "pd", "add"].map(k => (
                              <td key={k} style={S.td}>{rx[k] ?? "-"}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ textAlign: "center", padding: 60 }}>
      <div style={{ display: "inline-block", width: 36, height: 36, border: "3px solid #f0f0f0", borderTopColor: "#ee4d2d", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", background: "#f5f5f5", fontFamily: "system-ui,sans-serif" },
  nav: { background: "#ee4d2d", height: 56, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", position: "sticky", top: 0, zIndex: 100 },
  navInner: { maxWidth: 1100, margin: "0 auto", height: "100%", padding: "0 16px", display: "flex", alignItems: "center", gap: 16 },
  logo: { fontSize: 18, fontWeight: 800, color: "white", cursor: "pointer" },
  navBtn: { background: "transparent", border: "none", color: "white", fontSize: 13, cursor: "pointer", padding: "6px 10px" },
  navBtnUser: { background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 4, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "6px 12px" },
  container: { maxWidth: 1100, margin: "0 auto", padding: "24px 16px" },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  pageTitle: { fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 4 },
  pageSub: { fontSize: 14, color: "#888" },
  btnAdd: { padding: "10px 20px", background: "#ee4d2d", color: "white", border: "none", borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnSave: { padding: "11px 28px", background: "#ee4d2d", color: "white", border: "none", borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnCancel: { padding: "11px 20px", background: "#f5f5f5", color: "#555", border: "1px solid #ddd", borderRadius: 4, fontSize: 14, cursor: "pointer" },
  btnPrimary: { padding: "7px 14px", background: "#ee4d2d", color: "white", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  btnOutline: { padding: "7px 14px", background: "white", color: "#555", border: "1px solid #ddd", borderRadius: 4, fontSize: 13, cursor: "pointer" },

  formCard: { background: "white", borderRadius: 8, padding: 24, marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  formTitle: { fontSize: 17, fontWeight: 700, marginBottom: 20, color: "#111" },
  field: { marginBottom: 16 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4, fontSize: 14, outline: "none", boxSizing: "border-box" },
  eyeGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 },
  eyeSection: { background: "#fafafa", borderRadius: 6, padding: 16 },
  eyeHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 14 },
  eyeDot: { width: 10, height: 10, borderRadius: "50%", background: "#ee4d2d", display: "inline-block" },
  eyeTitle: { fontSize: 14, fontWeight: 700, color: "#333" },
  fieldRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  fieldLabel: { width: 120, fontSize: 12, color: "#666", flexShrink: 0 },
  fieldInput: { flex: 1, padding: "7px 10px", border: "1px solid #ddd", borderRadius: 4, fontSize: 13, outline: "none" },
  formActions: { display: "flex", gap: 10 },

  profileList: { display: "flex", flexDirection: "column", gap: 16 },
  profileCard: { background: "white", borderRadius: 8, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
  profileTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  profileInfo: { display: "flex", gap: 14, alignItems: "center" },
  profileIcon: { width: 44, height: 44, background: "#fff5f5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 },
  profileName: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  profileMeta: { fontSize: 12, color: "#888" },
  badge: { padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600 },
  badgeGreen: { background: "#dcfce7", color: "#16a34a" },
  badgeGray: { background: "#f3f4f6", color: "#888" },
  rxTable: { borderRadius: 6, overflow: "hidden", border: "1px solid #f0f0f0" },
  th: { padding: "10px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#888" },
  td: { padding: "10px 14px", fontSize: 13, color: "#333" },
  empty: { textAlign: "center", padding: "80px 0" },
};