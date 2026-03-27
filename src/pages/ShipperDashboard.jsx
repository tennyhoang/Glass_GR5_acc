import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../services/authService";
import api from "../services/api";

const DELIVERY_STATUS = {
  PENDING:   { bg: "#fef3c7", color: "#d97706", label: "Cho giao" },
  SHIPPING:  { bg: "#cffafe", color: "#0891b2", label: "Dang giao" },
  DELIVERED: { bg: "#dcfce7", color: "#16a34a", label: "Da giao" },
  FAILED:    { bg: "#fee2e2", color: "#dc2626", label: "Giao that bai" },
};

const ORDER_STATUS = {
  SHIPPING:       { bg: "#cffafe", color: "#0891b2", label: "Dang giao hang" },
  DELIVERED:      { bg: "#dcfce7", color: "#16a34a", label: "Da giao hang" },
  RETURN_PENDING: { bg: "#fce7f3", color: "#db2777", label: "Hoan hang" },
  CANCELLED:      { bg: "#fee2e2", color: "#dc2626", label: "Da huy" },
};

export default function ShipperDashboard() {
  const navigate  = useNavigate();
  const user      = getUser();
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [updating, setUpdating]   = useState(false);
  const [filter, setFilter]       = useState("ALL");
  const [confirmModal, setConfirmModal] = useState(null); // { type: "DELIVERED"|"FAILED", orderId }

  useEffect(() => {
    if (!user || !["ADMIN", "SHIPPER"].includes(user.role)) { navigate("/"); return; }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/shipper/orders");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleUpdateStatus = async (orderId, status) => {
    setUpdating(true);
    try {
      await api.put("/shipper/orders/" + orderId + "/status", { status });
      await fetchOrders();
      setSelected(prev => prev?.orderId === orderId ? { ...prev, status: "DELIVERED", manufacturingStatus: "DELIVERED" } : prev);
    } catch (e) { alert("Loi: " + (e.response?.data?.message || e.message)); }
    finally { setUpdating(false); setConfirmModal(null); }
  };

  const handleFailed = async (orderId) => {
    setUpdating(true);
    try {
      await api.put("/shipper/orders/" + orderId + "/failed");
      await fetchOrders();
      setSelected(null);
    } catch (e) { alert("Loi: " + (e.response?.data?.message || e.message)); }
    finally { setUpdating(false); setConfirmModal(null); }
  };

  const fmt     = n => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);
  const fmtDate = d => d ? new Date(d).toLocaleString("vi-VN") : "";

  // deliveryStatus nằm trong manufacturingStatus (theo FulfillmentService)
  const getDeliveryStatus = (order) => order.manufacturingStatus || "PENDING";

  const filtered = filter === "ALL"
    ? orders
    : orders.filter(o => getDeliveryStatus(o) === filter);

  const pendingCount   = orders.filter(o => getDeliveryStatus(o) === "PENDING").length;
  const shippingCount  = orders.filter(o => getDeliveryStatus(o) === "SHIPPING").length;
  const deliveredCount = orders.filter(o => getDeliveryStatus(o) === "DELIVERED").length;
  const failedCount    = orders.filter(o => getDeliveryStatus(o) === "FAILED").length;

  return (
    <div style={S.page}>
      {/* NAV */}
      <nav style={S.nav}>
        <div style={S.navInner}>
          <div style={S.logo} onClick={() => navigate("/")}>👓 GlassesShop</div>
          <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600, fontSize: 14 }}>
            🚚 Shipper — Quan ly giao hang
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button style={S.navBtn} onClick={() => navigate("/")}>Trang chu</button>
            <button style={S.navBtnUser}>{user?.name?.split(" ").pop() || user?.username}</button>
            <button style={S.navBtnLogout} onClick={() => { logout(); navigate("/"); }}>Dang xuat</button>
          </div>
        </div>
      </nav>

      <div style={S.container}>
        {/* STATS */}
        <div style={S.statsRow}>
          {[
            { label: "Tong don duoc giao", value: orders.length,   color: "#0891b2" },
            { label: "Cho bat dau giao",   value: pendingCount,    color: "#d97706" },
            { label: "Dang giao",          value: shippingCount,   color: "#2563eb" },
            { label: "Da giao thanh cong", value: deliveredCount,  color: "#16a34a" },
            { label: "Giao that bai",      value: failedCount,     color: "#dc2626" },
          ].map(s => (
            <div key={s.label} style={{ ...S.statBox, borderLeft: "4px solid " + s.color }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 400px" : "1fr", gap: 16, alignItems: "start" }}>
          {/* DANH SÁCH */}
          <div style={S.listPanel}>
            <div style={S.panelHeader}>
              <h3 style={S.panelTitle}>Don hang can giao</h3>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {[
                  { key: "ALL",       label: "Tat ca" },
                  { key: "PENDING",   label: "Cho giao" },
                  { key: "SHIPPING",  label: "Dang giao" },
                  { key: "DELIVERED", label: "Da giao" },
                  { key: "FAILED",    label: "That bai" },
                ].map(f => (
                  <button key={f.key} onClick={() => setFilter(f.key)}
                    style={{ padding: "4px 10px", border: "none", borderRadius: 4, fontSize: 11, cursor: "pointer",
                      background: filter === f.key ? "#0891b2" : "#f5f5f5",
                      color: filter === f.key ? "white" : "#666",
                      fontWeight: filter === f.key ? 700 : 400 }}>
                    {f.label}
                  </button>
                ))}
                <button style={S.btnRefresh} onClick={fetchOrders}>↻</button>
              </div>
            </div>

            {loading ? <Spinner /> : filtered.length === 0 ? (
              <div style={S.empty}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🚚</div>
                <div>Chua co don hang nao{filter !== "ALL" ? " trong trang thai nay" : ""}!</div>
              </div>
            ) : (
              <div style={{ maxHeight: "calc(100vh - 280px)", overflow: "auto" }}>
                {filtered.map(order => {
                  const ds = DELIVERY_STATUS[getDeliveryStatus(order)] || DELIVERY_STATUS.PENDING;
                  const isCOD = order.paymentMethod === "COD" && order.paymentStatus !== "PAID";
                  return (
                    <div key={order.orderId}
                      style={{ ...S.orderCard, ...(selected?.orderId === order.orderId ? S.orderCardActive : {}) }}
                      onClick={() => setSelected(order)}>
                      <div style={S.cardTop}>
                        <span style={S.orderId}>Don #{order.orderId}</span>
                        <span style={{ ...S.badge, background: ds.bg, color: ds.color }}>{ds.label}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "#444", margin: "4px 0 2px", fontWeight: 600 }}>
                        👤 {order.customerName || "Khach hang"}
                      </div>
                      <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
                        📍 {order.shippingAddress}
                      </div>
                      {(order.items || []).length > 0 && (
                        <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>
                          {order.items.slice(0, 2).map((item, i) => (
                            <span key={i} style={{ marginRight: 8 }}>
                              📦 {item.productName || "San pham"}{item.quantity > 1 ? " x" + item.quantity : ""}
                            </span>
                          ))}
                          {order.items.length > 2 && <span style={{ color: "#ccc" }}>+{order.items.length - 2} sp nua</span>}
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700, color: "#ee4d2d", fontSize: 15 }}>{fmt(order.finalAmount)}</span>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          {isCOD && (
                            <span style={{ background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                              💵 COD
                            </span>
                          )}
                          {order.paymentStatus === "PAID" && (
                            <span style={{ color: "#16a34a", fontSize: 11, fontWeight: 600 }}>✅ Da TT</span>
                          )}
                          <span style={{ fontSize: 11, color: "#aaa" }}>
                            {order.orderDate ? new Date(order.orderDate).toLocaleDateString("vi-VN") : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CHI TIẾT */}
          {selected && (
            <div style={S.detailPanel}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid #f0f0f0" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Don #{selected.orderId}</h3>
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#aaa" }}>✕</button>
              </div>

              {/* Badge trạng thái giao */}
              {(() => {
                const ds = DELIVERY_STATUS[getDeliveryStatus(selected)] || DELIVERY_STATUS.PENDING;
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, padding: "10px 12px", background: ds.bg, borderRadius: 6 }}>
                    <span style={{ fontSize: 20 }}>🚚</span>
                    <div>
                      <div style={{ fontSize: 11, color: ds.color, fontWeight: 700 }}>TRANG THAI GIAO HANG</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: ds.color }}>{ds.label}</div>
                    </div>
                  </div>
                );
              })()}

              {/* COD warning */}
              {selected.paymentMethod === "COD" && selected.paymentStatus !== "PAID" && (
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "10px 12px", marginBottom: 12, fontSize: 13, color: "#92400e" }}>
                  💵 <strong>Don COD</strong> — Thu <strong>{fmt(selected.finalAmount)}</strong> khi giao hang thanh cong!
                </div>
              )}

              {/* Thông tin */}
              <div style={S.infoBox}>
                <div style={S.infoTitle}>THONG TIN GIAO HANG</div>
                {[
                  ["Khach hang",    selected.customerName || "ID " + selected.customerId],
                  ["Dia chi giao",  selected.shippingAddress],
                  ["Tong tien",     fmt(selected.finalAmount)],
                  ["Phuong thuc TT", selected.paymentMethod === "COD" ? "💵 Tien mat (COD)" : "🏦 Chuyen khoan"],
                  ["Trang thai TT", selected.paymentStatus === "PAID" ? "✅ Da thanh toan" : "⏳ Chua thanh toan"],
                  ["Ngay dat hang", fmtDate(selected.orderDate)],
                ].map(([l, v]) => (
                  <div key={l} style={S.infoRow}>
                    <span style={S.infoLabel}>{l}</span>
                    <span style={S.infoValue}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Sản phẩm */}
              {(selected.items || []).length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={S.infoTitle}>SAN PHAM ({selected.items.length})</div>
                  {selected.items.map((item, i) => (
                    <div key={i} style={S.itemCard}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{item.productName || "San pham"}</div>
                          <div style={{ fontSize: 11, color: "#888" }}>x{item.quantity} · {fmt(item.price)}/cai</div>
                        </div>
                        <div style={{ fontWeight: 700, color: "#ee4d2d" }}>{fmt((item.price || 0) * (item.quantity || 1))}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Hành động */}
              <div style={S.infoTitle}>HANH DONG GIAO HANG</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>

                {getDeliveryStatus(selected) === "PENDING" && (
                  <button style={{ ...S.actionBtn, background: "#0891b2" }} disabled={updating}
                    onClick={() => handleUpdateStatus(selected.orderId, "SHIPPING")}>
                    🚚 Bat dau giao hang
                  </button>
                )}

                {getDeliveryStatus(selected) === "SHIPPING" && (
                  <>
                    <div style={{ background: "#ecfeff", borderRadius: 6, padding: "10px 12px", fontSize: 13, color: "#0891b2", fontWeight: 600 }}>
                      🚚 Dang tren duong giao...
                    </div>
                    <button style={{ ...S.actionBtn, background: "#16a34a" }} disabled={updating}
                      onClick={() => setConfirmModal({ type: "DELIVERED", orderId: selected.orderId })}>
                      ✅ Giao hang thanh cong
                    </button>
                    <button style={{ ...S.actionBtn, background: "#dc2626" }} disabled={updating}
                      onClick={() => setConfirmModal({ type: "FAILED", orderId: selected.orderId })}>
                      ❌ Giao hang that bai
                    </button>
                  </>
                )}

                {getDeliveryStatus(selected) === "DELIVERED" && (
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: 14, fontSize: 13, color: "#16a34a", fontWeight: 600, textAlign: "center" }}>
                    ✅ Giao hang thanh cong!<br />
                    <span style={{ fontWeight: 400, fontSize: 12 }}>Don hang da duoc giao den khach hang.</span>
                  </div>
                )}

                {getDeliveryStatus(selected) === "FAILED" && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: 14, fontSize: 13, color: "#dc2626", fontWeight: 600, textAlign: "center" }}>
                    ❌ Giao hang that bai!<br />
                    <span style={{ fontWeight: 400, fontSize: 12 }}>Don hang dang duoc xu ly hoan tra.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONFIRM MODAL */}
      {confirmModal && (
        <div style={S.overlay} onClick={e => e.target === e.currentTarget && setConfirmModal(null)}>
          <div style={S.modal}>
            {confirmModal.type === "DELIVERED" ? (
              <>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Xac nhan giao hang thanh cong</h3>
                {/* COD reminder */}
                {(() => {
                  const ord = orders.find(o => o.orderId === confirmModal.orderId);
                  return ord?.paymentMethod === "COD" && ord?.paymentStatus !== "PAID" ? (
                    <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: 12, marginBottom: 14, fontSize: 13, color: "#92400e" }}>
                      💵 Ban da thu duoc <strong>{fmt(ord.finalAmount)}</strong> tu khach chua?
                    </div>
                  ) : null;
                })()}
                <p style={{ color: "#666", fontSize: 13, marginBottom: 20 }}>
                  Xac nhan rang don hang #{confirmModal.orderId} da duoc giao thanh cong?
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button style={{ flex: 1, padding: 12, background: "#f5f5f5", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
                    onClick={() => setConfirmModal(null)}>Huy</button>
                  <button style={{ flex: 1, padding: 12, background: "#16a34a", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
                    onClick={() => handleUpdateStatus(confirmModal.orderId, "DELIVERED")} disabled={updating}>
                    {updating ? "Dang xu ly..." : "Xac nhan"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Bao cao giao hang that bai</h3>
                <p style={{ color: "#666", fontSize: 13, marginBottom: 20 }}>
                  Khong giao duoc don hang #{confirmModal.orderId}?<br />
                  Don hang se chuyen sang trang thai "Hoan hang".
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button style={{ flex: 1, padding: 12, background: "#f5f5f5", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
                    onClick={() => setConfirmModal(null)}>Huy</button>
                  <button style={{ flex: 1, padding: 12, background: "#dc2626", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}
                    onClick={() => handleFailed(confirmModal.orderId)} disabled={updating}>
                    {updating ? "Dang xu ly..." : "Bao cao that bai"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ textAlign: "center", padding: 60 }}>
      <div style={{ display: "inline-block", width: 32, height: 32, border: "3px solid #f0f0f0", borderTopColor: "#0891b2", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const S = {
  page:          { minHeight: "100vh", background: "#f5f5f5", fontFamily: "system-ui,sans-serif" },
  nav:           { background: "#0891b2", height: 56, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", position: "sticky", top: 0, zIndex: 100 },
  navInner:      { maxWidth: 1200, margin: "0 auto", height: "100%", padding: "0 16px", display: "flex", alignItems: "center", gap: 16 },
  logo:          { fontSize: 18, fontWeight: 800, color: "white", cursor: "pointer", flexShrink: 0 },
  navBtn:        { background: "transparent", border: "none", color: "white", fontSize: 13, cursor: "pointer", padding: "6px 10px" },
  navBtnUser:    { background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 4, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "6px 12px" },
  navBtnLogout:  { background: "rgba(0,0,0,0.2)", border: "none", borderRadius: 4, color: "white", fontSize: 13, cursor: "pointer", padding: "6px 12px" },
  container:     { maxWidth: 1200, margin: "0 auto", padding: "20px 16px" },
  statsRow:      { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" },
  statBox:       { background: "white", borderRadius: 6, padding: "12px 14px", flex: 1, minWidth: 100, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
  listPanel:     { background: "white", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
  panelHeader:   { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #f0f0f0", flexWrap: "wrap", gap: 8 },
  panelTitle:    { fontSize: 15, fontWeight: 700, margin: 0 },
  btnRefresh:    { padding: "4px 10px", background: "#f5f5f5", border: "none", borderRadius: 4, fontSize: 13, cursor: "pointer" },
  orderCard:     { padding: "14px 16px", borderBottom: "1px solid #f9fafb", cursor: "pointer", transition: "background 0.1s" },
  orderCardActive: { background: "#ecfeff", borderLeft: "3px solid #0891b2" },
  cardTop:       { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  orderId:       { fontWeight: 700, fontSize: 14 },
  badge:         { padding: "3px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600 },
  empty:         { textAlign: "center", padding: 60, color: "#aaa", fontSize: 14 },
  detailPanel:   { background: "white", borderRadius: 8, padding: 18, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", position: "sticky", top: 76, maxHeight: "calc(100vh - 100px)", overflow: "auto" },
  infoBox:       { background: "#f0fdfe", borderRadius: 6, padding: 12, marginBottom: 12 },
  infoTitle:     { fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 0.5, marginBottom: 8 },
  infoRow:       { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 },
  infoLabel:     { color: "#888" },
  infoValue:     { fontWeight: 600, maxWidth: "60%", textAlign: "right", wordBreak: "break-word" },
  itemCard:      { background: "#fafafa", borderRadius: 6, padding: "10px 12px", marginBottom: 8, border: "1px solid #e0f7fa" },
  actionBtn:     { padding: "12px", color: "white", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" },
  overlay:       { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 },
  modal:         { background: "white", borderRadius: 10, padding: 28, maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" },
};
