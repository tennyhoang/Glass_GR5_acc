import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../services/authService";
import api from "../services/api";

const STATUS_COLORS = {
  PENDING:       { bg:"#fef3c7", color:"#d97706", label:"Cho XN" },
  CONFIRMED:     { bg:"#dbeafe", color:"#2563eb", label:"Da XN" },
  MANUFACTURING: { bg:"#ede9fe", color:"#7c3aed", label:"Dang san xuat" },
  SHIPPING:      { bg:"#cffafe", color:"#0891b2", label:"Dang giao hang" },
  DELIVERED:     { bg:"#dcfce7", color:"#16a34a", label:"Da giao hang" },
  CANCELLED:     { bg:"#fee2e2", color:"#dc2626", label:"Da huy" },
};

const MFG_STATUS = {
  PENDING:     { label:"Cho san xuat",  color:"#d97706", bg:"#fef3c7" },
  IN_PROGRESS: { label:"Dang san xuat", color:"#7c3aed", bg:"#ede9fe" },
  COMPLETED:   { label:"Hoan thanh SX", color:"#16a34a", bg:"#dcfce7" },
};

const TYPE_ICON  = { READY_MADE:"👓", CONTACT_LENS:"🔵", MY_GLASSES:"🎨", FRAME:"🕶️", LENS:"🔍" };
const TYPE_LABEL = { READY_MADE:"Kinh co san", CONTACT_LENS:"Kinh ap trong", MY_GLASSES:"Kinh thiet ke", FRAME:"Gong kinh", LENS:"Trong kinh" };

export default function OperationDashboard() {
  const navigate  = useNavigate();
  const user      = getUser();
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [acting, setActing]     = useState(false);
  const [filter, setFilter]     = useState("ALL");

  useEffect(() => {
    if (!user || !["ADMIN","OPERATION"].includes(user.role)) { navigate("/"); return; }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/operation/orders");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (orderId, status) => {
    const labels = { IN_PROGRESS:"Bat dau san xuat?", COMPLETED:"Xac nhan hoan thanh san xuat?" };
    if (!window.confirm(labels[status] || "Cap nhat?")) return;
    setActing(true);
    try {
      await api.put("/operation/orders/"+orderId+"/status", { status });
      await fetchOrders();
      setSelected(prev => prev ? { ...prev, manufacturingStatus:status } : null);
    } catch (e) { alert("Loi: " + (e.response?.data?.message || e.message)); }
    finally { setActing(false); }
  };

  const fmt     = n => new Intl.NumberFormat("vi-VN", { style:"currency", currency:"VND" }).format(n || 0);
  const fmtDate = d => d ? new Date(d).toLocaleString("vi-VN") : "";

  const filtered = filter === "ALL"
    ? orders
    : orders.filter(o => (o.manufacturingStatus || "PENDING") === filter);

  const pendingCount    = orders.filter(o => !o.manufacturingStatus || o.manufacturingStatus === "PENDING").length;
  const inProgressCount = orders.filter(o => o.manufacturingStatus === "IN_PROGRESS").length;
  const completedCount  = orders.filter(o => o.manufacturingStatus === "COMPLETED").length;

  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <div style={S.navInner}>
          <div style={S.logo} onClick={() => navigate("/")}>👓 GlassesShop</div>
          <span style={{ color:"rgba(255,255,255,0.9)", fontWeight:600, fontSize:14 }}>
            🔧 Operation — Quan ly san xuat
          </span>
          <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
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
            { label:"Tong don duoc giao", value:orders.length,    color:"#7c3aed" },
            { label:"Cho san xuat",       value:pendingCount,     color:"#f59e0b" },
            { label:"Dang san xuat",      value:inProgressCount,  color:"#7c3aed" },
            { label:"Hoan thanh SX",      value:completedCount,   color:"#16a34a" },
          ].map(s => (
            <div key={s.label} style={{ ...S.statBox, borderLeft:"4px solid "+s.color }}>
              <div style={{ fontSize:26, fontWeight:800, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:11, color:"#888", marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns: selected ? "1fr 400px" : "1fr", gap:16, alignItems:"start" }}>
          {/* DANH SÁCH */}
          <div style={S.listPanel}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", borderBottom:"1px solid #f0f0f0" }}>
              <h3 style={{ fontSize:15, fontWeight:700 }}>Don hang can san xuat</h3>
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                {[
                  { key:"ALL",         label:"Tat ca" },
                  { key:"PENDING",     label:"Cho SX" },
                  { key:"IN_PROGRESS", label:"Dang SX" },
                  { key:"COMPLETED",   label:"Xong" },
                ].map(f => (
                  <button key={f.key} onClick={() => setFilter(f.key)}
                    style={{ padding:"4px 10px", border:"none", borderRadius:4, fontSize:11, cursor:"pointer",
                      background: filter === f.key ? "#7c3aed" : "#f5f5f5",
                      color: filter === f.key ? "white" : "#666",
                      fontWeight: filter === f.key ? 700 : 400 }}>
                    {f.label}
                  </button>
                ))}
                <button style={S.btnRefresh} onClick={fetchOrders}>↻</button>
              </div>
            </div>

            {loading ? <Spinner /> : filtered.length === 0 ? (
              <div style={{ textAlign:"center", padding:60, color:"#aaa" }}>Khong co don hang nao!</div>
            ) : (
              <div style={{ maxHeight:"calc(100vh - 260px)", overflow:"auto" }}>
                {filtered.map(order => {
                  const mfgSt = MFG_STATUS[order.manufacturingStatus || "PENDING"];
                  const isActive = selected?.orderId === order.orderId;
                  return (
                    <div key={order.orderId}
                      style={{ ...S.orderCard, ...(isActive ? S.orderCardActive : {}) }}
                      onClick={() => setSelected(order)}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                        <span style={{ fontWeight:700, fontSize:14 }}>Don #{order.orderId}</span>
                        <span style={{ padding:"2px 8px", borderRadius:999, fontSize:11, fontWeight:600, background:mfgSt.bg, color:mfgSt.color }}>
                          {mfgSt.label}
                        </span>
                      </div>
                      {(order.items || []).length > 0 && (
                        <div style={{ marginBottom:6 }}>
                          {order.items.map((item, i) => (
                            <div key={i} style={{ fontSize:12, color:"#555", display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                              <span>{TYPE_ICON[item.productType] || "📦"}</span>
                              <span style={{ fontWeight:600 }}>{item.productName || "San pham"}</span>
                              <span style={{ color:"#aaa" }}>x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{ fontWeight:700, color:"#7c3aed", fontSize:13 }}>{fmt(order.finalAmount)}</span>
                        <span style={{ fontSize:11, color:"#aaa" }}>
                          {order.orderDate ? new Date(order.orderDate).toLocaleDateString("vi-VN") : ""}
                        </span>
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
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, paddingBottom:12, borderBottom:"1px solid #f0f0f0" }}>
                <h3 style={{ fontSize:15, fontWeight:700 }}>Don #{selected.orderId}</h3>
                <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", fontSize:18, cursor:"pointer", color:"#aaa" }}>✕</button>
              </div>

              {/* Badge trạng thái sản xuất */}
              {(() => {
                const mfgSt = MFG_STATUS[selected.manufacturingStatus || "PENDING"];
                return (
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, padding:"10px 12px", background:mfgSt.bg, borderRadius:6 }}>
                    <span style={{ fontSize:18 }}>🏭</span>
                    <div>
                      <div style={{ fontSize:11, color:mfgSt.color, fontWeight:700 }}>TRANG THAI SAN XUAT</div>
                      <div style={{ fontSize:14, fontWeight:700, color:mfgSt.color }}>{mfgSt.label}</div>
                    </div>
                  </div>
                );
              })()}

              {/* Thông tin đơn */}
              <div style={S.infoBox}>
                <div style={S.infoTitle}>THONG TIN DON HANG</div>
                {[
                  ["Ma don",     "#"+selected.orderId],
                  ["Khach hang", selected.customerName || "ID "+selected.customerId],
                  ["Dia chi",    selected.shippingAddress],
                  ["Tong tien",  fmt(selected.finalAmount)],
                  ["Ngay dat",   fmtDate(selected.orderDate)],
                ].map(([l, v]) => (
                  <div key={l} style={S.infoRow}>
                    <span style={S.infoLabel}>{l}</span>
                    <span style={S.infoValue}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Sản phẩm cần sản xuất */}
              {(selected.items || []).length > 0 && (
                <div style={{ marginBottom:14 }}>
                  <div style={S.infoTitle}>SAN PHAM CAN SAN XUAT</div>
                  {selected.items.map((item, i) => (
                    <div key={i} style={S.itemCard}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                          <span style={{ fontSize:22 }}>{TYPE_ICON[item.productType] || "📦"}</span>
                          <div>
                            <div style={{ fontWeight:700, fontSize:13 }}>{item.productName || "San pham"}</div>
                            <span style={S.typeBadge}>{TYPE_LABEL[item.productType] || item.productType}</span>
                          </div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontWeight:700, color:"#7c3aed" }}>x{item.quantity}</div>
                          <div style={{ fontSize:11, color:"#aaa" }}>{fmt(item.price)}/cai</div>
                        </div>
                      </div>
                      {item.productType === "MY_GLASSES" && (
                        <div style={{ marginTop:8, background:"#fef3c7", borderRadius:4, padding:"6px 8px", fontSize:11, color:"#92400e" }}>
                          ⚠️ Kinh thiet ke theo yeu cau — Kiem tra ky thong so truoc khi san xuat!
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div style={S.infoTitle}>CAP NHAT TIEN DO</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:8 }}>
                {(!selected.manufacturingStatus || selected.manufacturingStatus === "PENDING") && (
                  <button style={{ ...S.actionBtn, background:"#7c3aed" }} disabled={acting}
                    onClick={() => updateStatus(selected.orderId, "IN_PROGRESS")}>
                    🔧 Bat dau san xuat
                  </button>
                )}

                {selected.manufacturingStatus === "IN_PROGRESS" && (
                  <>
                    <div style={{ background:"#ede9fe", borderRadius:6, padding:"10px 12px", fontSize:13, color:"#7c3aed", fontWeight:600 }}>
                      🔧 Dang tien hanh san xuat...
                    </div>
                    <button style={{ ...S.actionBtn, background:"#16a34a" }} disabled={acting}
                      onClick={() => updateStatus(selected.orderId, "COMPLETED")}>
                      ✅ Hoan thanh san xuat — Chuyen giao hang
                    </button>
                  </>
                )}

                {selected.manufacturingStatus === "COMPLETED" && (
                  <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:6, padding:14, fontSize:13, color:"#16a34a", fontWeight:600, textAlign:"center" }}>
                    ✅ San xuat hoan thanh!<br />
                    <span style={{ fontWeight:400, fontSize:12 }}>Don hang dang duoc chuyen sang giao hang.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ textAlign:"center", padding:60 }}>
      <div style={{ display:"inline-block", width:32, height:32, border:"3px solid #f0f0f0", borderTopColor:"#7c3aed", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const S = {
  page:         { minHeight:"100vh", background:"#f5f5f5", fontFamily:"system-ui,sans-serif" },
  nav:          { background:"#7c3aed", height:56, boxShadow:"0 2px 8px rgba(0,0,0,0.15)", position:"sticky", top:0, zIndex:100 },
  navInner:     { maxWidth:1200, margin:"0 auto", height:"100%", padding:"0 16px", display:"flex", alignItems:"center", gap:16 },
  logo:         { fontSize:18, fontWeight:800, color:"white", cursor:"pointer", flexShrink:0 },
  navBtn:       { background:"transparent", border:"none", color:"white", fontSize:13, cursor:"pointer", padding:"6px 10px" },
  navBtnUser:   { background:"rgba(255,255,255,0.2)", border:"none", borderRadius:4, color:"white", fontSize:13, fontWeight:600, cursor:"pointer", padding:"6px 12px" },
  navBtnLogout: { background:"rgba(0,0,0,0.2)", border:"none", borderRadius:4, color:"white", fontSize:13, cursor:"pointer", padding:"6px 12px" },
  container:    { maxWidth:1200, margin:"0 auto", padding:"20px 16px" },
  statsRow:     { display:"flex", gap:14, marginBottom:16 },
  statBox:      { background:"white", borderRadius:6, padding:"14px 18px", flex:1, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" },
  listPanel:    { background:"white", borderRadius:8, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" },
  btnRefresh:   { padding:"4px 10px", background:"#f5f5f5", border:"none", borderRadius:4, fontSize:13, cursor:"pointer" },
  orderCard:    { padding:"14px 16px", borderBottom:"1px solid #f9fafb", cursor:"pointer", transition:"background 0.1s" },
  orderCardActive: { background:"#faf5ff", borderLeft:"3px solid #7c3aed" },
  detailPanel:  { background:"white", borderRadius:8, padding:18, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", position:"sticky", top:76, maxHeight:"calc(100vh - 100px)", overflow:"auto" },
  infoBox:      { background:"#faf5ff", borderRadius:6, padding:12, marginBottom:12 },
  infoTitle:    { fontSize:11, fontWeight:700, color:"#aaa", letterSpacing:0.5, marginBottom:8 },
  infoRow:      { display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6 },
  infoLabel:    { color:"#888" },
  infoValue:    { fontWeight:600, maxWidth:"60%", textAlign:"right", wordBreak:"break-word" },
  itemCard:     { background:"#fafafa", borderRadius:6, padding:"10px 12px", marginBottom:8, border:"1px solid #ede9fe" },
  typeBadge:    { padding:"2px 7px", background:"#ede9fe", color:"#7c3aed", borderRadius:4, fontSize:10, fontWeight:600 },
  actionBtn:    { padding:"12px", color:"white", border:"none", borderRadius:6, fontSize:13, fontWeight:600, cursor:"pointer" },
};