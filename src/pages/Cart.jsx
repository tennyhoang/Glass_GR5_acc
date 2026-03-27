import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../services/authService";
import api from "../services/api";

export default function Cart() {
  const navigate = useNavigate();
  const user = getUser();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [productDetails, setProductDetails] = useState({});

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await api.get("/cart");
      setCart(res.data);
      // Fetch chi tiết từng sản phẩm
      const items = res.data?.items || [];
      fetchAllProductDetails(items);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchAllProductDetails = async (items) => {
    const details = {};
    await Promise.all(items.map(async (item) => {
      try {
        const ep = getDetailEndpoint(item.productType, item.productId);
        if (!ep) return;
        const r = await api.get(ep);
        details[item.cartItemId] = r.data;
      } catch (e) { /* skip */ }
    }));
    setProductDetails(details);
  };

  const getDetailEndpoint = (type, id) => {
    switch (type) {
      case "READY_MADE": return "/admin/rmglasses/public/" + id;
      case "CONTACT_LENS": return "/admin/contactlens/public/" + id;
      case "FRAME": return "/admin/frames/public/" + id;
      case "LENS": return "/admin/lens/public/" + id;
      default: return null;
    }
  };

  const handleRemove = async (cartItemId) => {
    if (!window.confirm("Xoa san pham nay khoi gio hang?")) return;
    try {
      await api.delete("/cart/remove/" + cartItemId);
      fetchCart();
    } catch (e) { alert("Loi: " + (e.response?.data?.message || e.message)); }
  };

  const handleUpdateQty = async (cartItemId, qty) => {
    if (qty < 1) { handleRemove(cartItemId); return; }
    setUpdatingId(cartItemId);
    try {
      await api.put("/cart/update/" + cartItemId, { quantity: qty });
      fetchCart();
    } catch (e) { alert("Loi: " + (e.response?.data?.message || e.message)); }
    finally { setUpdatingId(null); }
  };

  const fmt = n => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

  const getTypeLabel = (type) => ({
    READY_MADE: "Kinh co san",
    CONTACT_LENS: "Kinh ap trong",
    MY_GLASSES: "Kinh thiet ke",
    FRAME: "Gong kinh",
    LENS: "Trong kinh",
  }[type] || type);

  const getTypeIcon = (type) => ({
    READY_MADE: "👓",
    CONTACT_LENS: "🔵",
    MY_GLASSES: "🎨",
    FRAME: "🕶️",
    LENS: "🔍",
  }[type] || "📦");

  const getProductDetails = (item, detail) => {
    if (!detail) return [];
    switch (item.productType) {
      case "READY_MADE": return [
        ["Thuong hieu", detail.brand],
        ["Do cau (SPH)", detail.fixedSph],
        ["Do tru (CYL)", detail.fixedCyl],
        ["Ton kho", detail.stock],
        ["Trang thai", detail.status === "ACTIVE" ? "Con hang" : "Het hang"],
      ].filter(([, v]) => v != null);
      case "CONTACT_LENS": return [
        ["Loai kinh", detail.contactType],
        ["Mau sac", detail.color],
        ["SPH min~max", detail.minSph + " ~ " + detail.maxSph],
        ["Ton kho", detail.stock],
      ].filter(([, v]) => v != null);
      case "FRAME": return [
        ["Thuong hieu", detail.brand],
        ["Chat lieu", detail.material],
        ["Kich co", detail.size],
        ["Mau sac", detail.color],
        ["Kieu gong", detail.rimType],
      ].filter(([, v]) => v != null);
      case "LENS": return [
        ["Loai trong", detail.lensType],
        ["SPH min~max", detail.minSph + " ~ " + detail.maxSph],
        ["Doi mau", detail.colorChange ? "Co" : "Khong"],
      ].filter(([, v]) => v != null);
      default: return [];
    }
  };

  const items = cart?.items || [];
  const total = items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);

  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <div style={S.navInner}>
          <div style={S.logo} onClick={() => navigate("/")}>👓 GlassesShop</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button style={S.navBtn} onClick={() => navigate("/")}>Trang chu</button>
            <button style={S.navBtn} onClick={() => navigate("/orders")}>Don hang</button>
            <button style={S.navBtnUser}>{user?.name?.split(" ").pop() || user?.username}</button>
          </div>
        </div>
      </nav>

      <div style={S.container}>
        <h2 style={S.pageTitle}>Gio Hang Cua Ban</h2>

        {loading ? <Spinner /> : items.length === 0 ? (
          <div style={S.empty}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
            <h3 style={{ marginBottom: 8 }}>Gio hang trong!</h3>
            <p style={{ color: "#888", marginBottom: 20 }}>Them san pham vao gio de bat dau mua sam</p>
            <button style={S.btnPrimary} onClick={() => navigate("/")}>Tiep tuc mua sam</button>
          </div>
        ) : (
          <div style={S.layout}>
            {/* DANH SÁCH SẢN PHẨM */}
            <div>
              {/* Header */}
              <div style={S.listHeader}>
                <span>San pham</span>
                <span>Don gia</span>
                <span>So luong</span>
                <span>Thanh tien</span>
                <span></span>
              </div>

              {items.map(item => {
                const detail = productDetails[item.cartItemId];
                const isExpanded = expandedId === item.cartItemId;
                const detailRows = getProductDetails(item, detail);

                return (
                  <div key={item.cartItemId} style={S.itemCard}>
                    {/* ROW CHÍNH */}
                    <div style={S.itemRow}>
                      {/* Icon + Tên */}
                      <div style={S.itemLeft}>
                        <div style={S.itemIcon}>{getTypeIcon(item.productType)}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={S.itemName}>{item.productName || "San pham"}</div>
                          <div style={S.itemTypeBadge}>{getTypeLabel(item.productType)}</div>
                          {/* Nút xem chi tiết */}
                          <button style={S.btnDetail}
                            onClick={() => setExpandedId(isExpanded ? null : item.cartItemId)}>
                            {isExpanded ? "▲ An chi tiet" : "▼ Xem chi tiet san pham"}
                          </button>
                        </div>
                      </div>

                      {/* Đơn giá */}
                      <div style={S.itemPrice}>{fmt(item.price)}</div>

                      {/* Số lượng */}
                      <div style={S.qtyControl}>
                        <button style={S.qtyBtn}
                          onClick={() => handleUpdateQty(item.cartItemId, item.quantity - 1)}
                          disabled={updatingId === item.cartItemId}>−</button>
                        <span style={S.qtyNum}>{item.quantity}</span>
                        <button style={S.qtyBtn}
                          onClick={() => handleUpdateQty(item.cartItemId, item.quantity + 1)}
                          disabled={updatingId === item.cartItemId}>+</button>
                      </div>

                      {/* Thành tiền */}
                      <div style={S.itemSubtotal}>{fmt((item.price || 0) * item.quantity)}</div>

                      {/* Xóa */}
                      <button style={S.btnRemove} onClick={() => handleRemove(item.cartItemId)}>🗑️</button>
                    </div>

                    {/* CHI TIẾT MỞ RỘNG */}
                    {isExpanded && (
                      <div style={S.expandBox}>
                        <div style={S.expandTitle}>Thong tin chi tiet san pham</div>
                        {detailRows.length > 0 ? (
                          <div style={S.detailGrid}>
                            {detailRows.map(([label, value]) => (
                              <div key={label} style={S.detailCell}>
                                <span style={S.detailLabel}>{label}</span>
                                <span style={S.detailValue}>{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        ) : item.productType === "MY_GLASSES" ? (
                          <p style={{ color: "#888", fontSize: 13 }}>Kinh thiet ke rieng theo yeu cau cua ban.</p>
                        ) : (
                          <p style={{ color: "#aaa", fontSize: 13 }}>Dang tai thong tin...</p>
                        )}
                        {/* Nút xem trang chi tiết */}
                        {["READY_MADE", "CONTACT_LENS", "FRAME", "LENS"].includes(item.productType) && (
                          <button style={S.btnViewPage}
                            onClick={() => {
                              const routeMap = { READY_MADE: "ready-made", CONTACT_LENS: "contact", FRAME: "frame", LENS: "lens" };
                              navigate("/product/" + routeMap[item.productType] + "/" + item.productId);
                            }}>
                            Xem trang san pham day du →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* TỔNG TIỀN */}
            <div style={S.summary}>
              <h3 style={S.summaryTitle}>Tom tat don hang</h3>
              <div style={S.summaryRow}>
                <span>So san pham</span>
                <span>{items.length} san pham</span>
              </div>
              <div style={S.summaryRow}>
                <span>Tong so luong</span>
                <span>{items.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              <div style={S.summaryRow}>
                <span>Phi van chuyen</span>
                <span style={{ color: "#16a34a", fontWeight: 600 }}>Mien phi</span>
              </div>
              <div style={S.divider} />
              <div style={{ ...S.summaryRow, fontWeight: 700, fontSize: 18 }}>
                <span>Tong cong</span>
                <span style={{ color: "#ee4d2d" }}>{fmt(total)}</span>
              </div>
              <button style={S.btnCheckout} onClick={() => navigate("/checkout")}>
                Tien hanh thanh toan →
              </button>
              <button style={S.btnContinue} onClick={() => navigate("/")}>
                ← Tiep tuc mua sam
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ textAlign: "center", padding: 60 }}>
      <div style={{ display: "inline-block", width: 32, height: 32, border: "3px solid #f0f0f0", borderTopColor: "#ee4d2d", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", background: "#f5f5f5", fontFamily: "system-ui,sans-serif" },
  nav: { background: "#ee4d2d", height: 56, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", position: "sticky", top: 0, zIndex: 100 },
  navInner: { maxWidth: 1100, margin: "0 auto", height: "100%", padding: "0 16px", display: "flex", alignItems: "center" },
  logo: { fontSize: 18, fontWeight: 800, color: "white", cursor: "pointer" },
  navBtn: { background: "transparent", border: "none", color: "white", fontSize: 13, cursor: "pointer", padding: "6px 10px" },
  navBtnUser: { background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 4, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "6px 12px" },
  container: { maxWidth: 1100, margin: "0 auto", padding: "24px 16px" },
  pageTitle: { fontSize: 22, fontWeight: 800, marginBottom: 20, color: "#111" },
  empty: { textAlign: "center", padding: 80 },
  layout: { display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" },

  listHeader: {
    display: "grid", gridTemplateColumns: "1fr 110px 130px 110px 40px",
    padding: "10px 16px", background: "white", borderRadius: "6px 6px 0 0",
    fontSize: 12, fontWeight: 700, color: "#888",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  itemCard: {
    background: "white", borderBottom: "1px solid #f5f5f5",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  itemRow: {
    display: "grid", gridTemplateColumns: "1fr 110px 130px 110px 40px",
    padding: "16px", alignItems: "center", gap: 8,
  },
  itemLeft: { display: "flex", gap: 12, alignItems: "flex-start" },
  itemIcon: {
    width: 64, height: 64, background: "#fff5f5", borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 30, flexShrink: 0,
  },
  itemName: { fontWeight: 600, fontSize: 14, color: "#111", marginBottom: 4, lineHeight: 1.4 },
  itemTypeBadge: {
    display: "inline-block", padding: "2px 8px",
    background: "#fef3c7", color: "#d97706",
    borderRadius: 4, fontSize: 11, fontWeight: 600, marginBottom: 6,
  },
  btnDetail: {
    background: "none", border: "none", color: "#3b82f6",
    fontSize: 12, cursor: "pointer", padding: 0, fontWeight: 500,
  },
  itemPrice: { fontSize: 14, fontWeight: 600, color: "#555" },
  qtyControl: {
    display: "flex", alignItems: "center", gap: 6,
    background: "#f5f5f5", borderRadius: 6, padding: "4px 8px", width: "fit-content",
  },
  qtyBtn: {
    width: 28, height: 28, border: "1px solid #ddd", background: "white",
    borderRadius: 4, fontSize: 16, fontWeight: 700, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  qtyNum: { fontWeight: 700, fontSize: 15, minWidth: 28, textAlign: "center" },
  itemSubtotal: { fontSize: 15, fontWeight: 700, color: "#ee4d2d" },
  btnRemove: {
    background: "none", border: "none", fontSize: 18,
    cursor: "pointer", color: "#dc2626", padding: 4,
  },

  expandBox: {
    margin: "0 16px 16px", background: "#f8fafc",
    borderRadius: 6, padding: 16,
    border: "1px solid #e2e8f0",
  },
  expandTitle: { fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 12 },
  detailGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8,
  },
  detailCell: {
    display: "flex", justifyContent: "space-between",
    background: "white", borderRadius: 4, padding: "8px 10px",
    border: "1px solid #e5e7eb",
  },
  detailLabel: { fontSize: 12, color: "#888" },
  detailValue: { fontSize: 12, fontWeight: 600, color: "#333" },
  btnViewPage: {
    marginTop: 12, padding: "7px 14px",
    background: "white", color: "#ee4d2d",
    border: "1px solid #ee4d2d", borderRadius: 4,
    fontSize: 12, fontWeight: 600, cursor: "pointer",
  },

  summary: {
    background: "white", borderRadius: 8, padding: 20,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)", position: "sticky", top: 76,
  },
  summaryTitle: { fontSize: 16, fontWeight: 700, marginBottom: 16 },
  summaryRow: { display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 10, color: "#555" },
  divider: { height: 1, background: "#f0f0f0", margin: "14px 0" },
  btnCheckout: {
    width: "100%", padding: "13px", background: "#ee4d2d", color: "white",
    border: "none", borderRadius: 4, fontSize: 15, fontWeight: 700,
    cursor: "pointer", marginTop: 16, marginBottom: 10,
  },
  btnContinue: {
    width: "100%", padding: "11px", background: "white", color: "#ee4d2d",
    border: "1px solid #ee4d2d", borderRadius: 4, fontSize: 14,
    fontWeight: 600, cursor: "pointer",
  },
  btnPrimary: {
    padding: "12px 28px", background: "#ee4d2d", color: "white",
    border: "none", borderRadius: 4, fontSize: 15, fontWeight: 600, cursor: "pointer",
  },
};