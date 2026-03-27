import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUser } from "../services/authService";
import { useToast } from "../components/Toast";
import api from "../services/api";

const SPH_OPTIONS = [];
for (let i = -20; i <= 20; i += 0.25) {
  SPH_OPTIONS.push(parseFloat(i.toFixed(2)));
}
const CYL_OPTIONS = [];
for (let i = -8; i <= 0; i += 0.25) {
  CYL_OPTIONS.push(parseFloat(i.toFixed(2)));
}
const AXIS_OPTIONS = Array.from({ length: 181 }, (_, i) => i);

export default function ProductDetail() {
  const navigate = useNavigate();
  const { type, id } = useParams();
  const user = getUser();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  // Prescription selection for kính có sẵn, frame, lens
  const [sph, setSph] = useState("0");
  const [cyl, setCyl] = useState("0");
  const [axis, setAxis] = useState("0");

  const ENDPOINTS = {
    "ready-made": `/admin/rmglasses/public/${id}`,
    "frame": `/admin/frames/public/${id}`,
    "lens": `/admin/lens/public/${id}`,
    "contact": `/admin/contactlens/public/${id}`,
  };

  useEffect(() => {
    const ep = ENDPOINTS[type];
    if (!ep) { navigate("/"); return; }
    api.get(ep)
      .then(r => setProduct(r.data))
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [type, id]);

  const fmt = n => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);
  const getPrice = () => product?.price || product?.basePrice || 0;

  const canAddToCart = ["ready-made", "contact", "frame", "lens"].includes(type);

  const getProductType = () => ({
    "ready-made": "READY_MADE",
    "contact": "CONTACT_LENS",
    "frame": "FRAME",
    "lens": "LENS",
  }[type]);

  const getProductId = () => ({
    "ready-made": product?.readyGlassesId,
    "frame": product?.frameId,
    "lens": product?.lensId,
    "contact": product?.contactLensId,
  }[type]);

  const handleAddToCart = async (buyNow = false) => {
    if (!user) { navigate("/login"); return; }
    setAdding(true);
    try {
      await api.post("/cart/add", {
        productType: getProductType(),
        productId: getProductId(),
        quantity: qty,
      });
      toast({ message: "Da them \"" + product.name + "\" vao gio hang!", type: "success" });
      if (buyNow) navigate("/cart");
    } catch (e) {
      toast({ message: e.response?.data?.message || "Them vao gio hang that bai!", type: "error" });
    } finally { setAdding(false); }
  };

  const getDetails = () => {
    if (!product) return [];
    switch (type) {
      case "ready-made": return [
        ["Do cau mac dinh (SPH)", product.fixedSph ?? "-"],
        ["Do tru mac dinh (CYL)", product.fixedCyl ?? "-"],
        ["Ton kho", product.stock ?? "-"],
        ["Trang thai", product.status === "ACTIVE" ? "Con hang" : "Het hang"],
      ];
      case "frame": return [
        ["Thuong hieu", product.brand || "-"],
        ["Chat lieu", product.material || "-"],
        ["Kich co", product.size || "-"],
        ["Kieu gong", product.rimType || "-"],
        ["Loai gong", product.frameType || "-"],
        ["Mau sac", product.color || "-"],
        ["Ton kho", product.stock ?? "-"],
      ];
      case "lens": return [
        ["Loai trong", product.lensType || "-"],
        ["SPH min", product.minSph ?? "-"],
        ["SPH max", product.maxSph ?? "-"],
        ["Doi mau", product.colorChange ? "Co" : "Khong"],
        ["Ton kho", product.stock ?? "-"],
      ];
      case "contact": return [
        ["Loai kinh", product.contactType || "-"],
        ["Thuong hieu", product.brand || "-"],
        ["Mau sac", product.color || "-"],
        ["SPH min", product.minSph ?? "-"],
        ["SPH max", product.maxSph ?? "-"],
        ["Ton kho", product.stock ?? "-"],
      ];
      default: return [];
    }
  };

  const TYPE_LABELS = {
    "ready-made": "Kinh co san",
    "frame": "Gong kinh",
    "lens": "Trong kinh",
    "contact": "Kinh ap trong",
  };

  // Có cần chọn độ không
  const needsPrescription = ["ready-made", "frame", "lens"].includes(type);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #f0f0f0", borderTopColor: "#ee4d2d", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "system-ui,sans-serif" }}>
      {/* NAV */}
      <nav style={{ background: "#ee4d2d", padding: "0 16px", height: 56, display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", gap: 16 }}>
          <div onClick={() => navigate("/")} style={{ cursor: "pointer", background: "white", borderRadius: 6, padding: "4px 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 18 }}>👓</span>
            <span style={{ color: "#ee4d2d", fontWeight: 800, fontSize: 16 }}>GlassesShop</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button onClick={() => navigate("/cart")} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", padding: "6px 12px", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>🛒 Gio hang</button>
            {user && <button onClick={() => navigate("/orders")} style={{ background: "transparent", border: "none", color: "white", padding: "6px 12px", cursor: "pointer", fontSize: 13 }}>📦 Don hang</button>}
          </div>
        </div>
      </nav>

      {/* BREADCRUMB */}
      <div style={{ background: "white", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", display: "flex", gap: 6, fontSize: 13, color: "#888" }}>
          <span style={{ cursor: "pointer", color: "#ee4d2d" }} onClick={() => navigate("/")}>Trang chu</span>
          <span>›</span>
          <span style={{ cursor: "pointer", color: "#ee4d2d" }} onClick={() => navigate("/")}>{ TYPE_LABELS[type] }</span>
          <span>›</span>
          <span style={{ color: "#333" }}>{product?.name}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px" }}>
        <div style={{ background: "white", borderRadius: 6, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", display: "grid", gridTemplateColumns: "380px 1fr", gap: 40 }}>

          {/* ẢNH */}
          <div>
            <div style={{ background: "linear-gradient(145deg, #fff5f5, #fff0ee)", borderRadius: 12, height: 340, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, overflow: "hidden" }}>
              {product?.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <div style={{ width: 160, height: 160, background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(238,77,45,0.15)", fontSize: 80 }}>
                  {type === "contact" ? "🔵" : type === "lens" ? "🔍" : "🕶️"}
                </div>
              )}
            </div>
          </div>

          {/* INFO */}
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <span style={{ background: "#fff5f5", color: "#ee4d2d", border: "1px solid #ee4d2d", borderRadius: 4, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>
                {TYPE_LABELS[type]}
              </span>
              {product?.status === "ACTIVE" && (
                <span style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 4, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>
                  Con hang
                </span>
              )}
            </div>

            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111", lineHeight: 1.4, marginBottom: 12 }}>{product?.name}</h1>

            {/* Rating */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f5f5f5" }}>
              <div style={{ display: "flex", gap: 2 }}>
                {[1,2,3,4,5].map(s => <span key={s} style={{ color: "#f59e0b", fontSize: 16 }}>★</span>)}
              </div>
              <span style={{ color: "#888", fontSize: 13 }}>4.9 | 128 danh gia | 500+ da ban</span>
            </div>

            {/* Giá */}
            <div style={{ background: "#fff5f5", borderRadius: 6, padding: "16px 20px", marginBottom: 20 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#ee4d2d" }}>{fmt(getPrice())}</div>
              <div style={{ fontSize: 13, color: "#888", marginTop: 4, textDecoration: "line-through" }}>
                {fmt(getPrice() * 1.2)} <span style={{ color: "#ee4d2d", textDecoration: "none", fontWeight: 600 }}>Tiet kiem 20%</span>
              </div>
            </div>

            {/* CHỌN ĐỘ CẬN */}
            {needsPrescription && (
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: 16, marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e40af", marginBottom: 14 }}>
                  👁️ Chon do kinh cua ban
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>
                      Do cau (SPH)
                    </label>
                    <select value={sph} onChange={e => setSph(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 4, fontSize: 13, outline: "none" }}>
                      {SPH_OPTIONS.map(v => (
                        <option key={v} value={v}>{v > 0 ? "+" + v : v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>
                      Do tru (CYL)
                    </label>
                    <select value={cyl} onChange={e => setCyl(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 4, fontSize: 13, outline: "none" }}>
                      {CYL_OPTIONS.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>
                      Truc (Axis)
                    </label>
                    <select value={axis} onChange={e => setAxis(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 4, fontSize: 13, outline: "none" }}>
                      {AXIS_OPTIONS.map(v => (
                        <option key={v} value={v}>{v}°</option>
                      ))}
                    </select>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: "#6b7280", marginTop: 10 }}>
                  * Do kinh se duoc luu vao don hang cua ban de cua hang san xuat dung do
                </p>
              </div>
            )}

            {/* Thông số */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 10 }}>Thong so ky thuat</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {getDetails().map(([label, value]) => (
                    <tr key={label} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "8px 12px", fontSize: 13, color: "#888", background: "#fafafa", width: 160 }}>{label}</td>
                      <td style={{ padding: "8px 12px", fontSize: 13, color: "#333", fontWeight: 600 }}>{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Số lượng + Buttons */}
            {canAddToCart && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 13, color: "#555", fontWeight: 600 }}>So luong:</span>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: 4, overflow: "hidden" }}>
                    <button onClick={() => setQty(q => Math.max(1, q - 1))}
                      style={{ width: 36, height: 36, border: "none", background: "#f5f5f5", fontSize: 18, cursor: "pointer", fontWeight: 600, color: "#555" }}>−</button>
                    <input readOnly value={qty}
                      style={{ width: 48, height: 36, border: "none", textAlign: "center", fontSize: 15, fontWeight: 600 }} />
                    <button onClick={() => setQty(q => q + 1)}
                      style={{ width: 36, height: 36, border: "none", background: "#f5f5f5", fontSize: 18, cursor: "pointer", fontWeight: 600, color: "#555" }}>+</button>
                  </div>
                  <span style={{ fontSize: 13, color: "#aaa" }}>{product?.stock || 0} san pham co san</span>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => handleAddToCart(false)} disabled={adding}
                    style={{ flex: 1, padding: "14px", background: "#fff5f5", color: "#ee4d2d", border: "2px solid #ee4d2d", borderRadius: 4, fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: adding ? 0.7 : 1 }}>
                    🛒 Them vao gio hang
                  </button>
                  <button onClick={() => handleAddToCart(true)} disabled={adding}
                    style={{ flex: 1, padding: "14px", background: "#ee4d2d", color: "white", border: "none", borderRadius: 4, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                    Mua ngay
                  </button>
                </div>
              </>
            )}

            {/* Policies */}
            <div style={{ display: "flex", gap: 20, marginTop: 20, paddingTop: 20, borderTop: "1px solid #f5f5f5", flexWrap: "wrap" }}>
              {["🚚 Freeship toan quoc", "✅ Chinh hang 100%", "🔄 Doi tra 30 ngay"].map(p => (
                <div key={p} style={{ fontSize: 12, color: "#555" }}>{p}</div>
              ))}
            </div>
          </div>
        </div>

        {/* MÔ TẢ */}
        <div style={{ background: "white", borderRadius: 6, padding: 24, marginTop: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 4, height: 20, background: "#ee4d2d", borderRadius: 2 }} />
            Mo ta san pham
          </h2>
          <div style={{ color: "#555", lineHeight: 1.8, fontSize: 14 }}>
            <p><strong>{product?.name}</strong> la san pham chat luong cao tu GlassesShop.</p>
            {type === "ready-made" && <p style={{ marginTop: 8 }}>Kinh co san, ban co the chon do kinh theo y muon truoc khi them vao gio hang.</p>}
            {type === "frame" && <p style={{ marginTop: 8 }}>Gong kinh {product?.brand || ""} chat lieu {product?.material || ""}, thiet ke tinh te.</p>}
            {type === "lens" && <p style={{ marginTop: 8 }}>Trong kinh loai {product?.lensType || ""}, ho tro dai do tu {product?.minSph} den {product?.maxSph}.</p>}
            {type === "contact" && <p style={{ marginTop: 8 }}>Kinh ap trong {product?.brand || ""}, tiet kiem va tien loi.</p>}
            <p style={{ marginTop: 8 }}>San pham duoc bao hanh 12 thang, doi tra trong vong 30 ngay.</p>
          </div>
        </div>
      </div>
    </div>
  );
}