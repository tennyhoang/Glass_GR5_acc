import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../services/authService";
import api from "../services/api";

const STATUS_COLORS = {
  PENDING:        { bg: "#fef3c7", color: "#d97706", label: "Cho xac nhan" },
  CONFIRMED:      { bg: "#dbeafe", color: "#2563eb", label: "Da xac nhan" },
  MANUFACTURING:  { bg: "#ede9fe", color: "#7c3aed", label: "Dang san xuat" },
  SHIPPING:       { bg: "#cffafe", color: "#0891b2", label: "Dang giao hang" },
  DELIVERED:      { bg: "#dcfce7", color: "#16a34a", label: "Da giao hang" },
  CANCELLED:      { bg: "#fee2e2", color: "#dc2626", label: "Da huy" },
  RETURN_PENDING: { bg: "#fce7f3", color: "#db2777", label: "Cho hoan hang" },
};

const FILTER_BTNS = ["ALL","PENDING","CONFIRMED","MANUFACTURING","SHIPPING","DELIVERED","RETURN_PENDING"];
const TYPE_ICON   = { READY_MADE:"👓", CONTACT_LENS:"🔵", MY_GLASSES:"🎨", FRAME:"🕶️", LENS:"🔍" };
const TYPE_LABEL  = { READY_MADE:"Kinh co san", CONTACT_LENS:"Kinh ap trong", MY_GLASSES:"Kinh thiet ke", FRAME:"Gong kinh", LENS:"Trong kinh" };

export default function StaffDashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState("ALL");
  const [selected, setSelected]     = useState(null);
  const [operations, setOperations] = useState([]);
  const [shippers, setShippers]     = useState([]);
  const [selOp, setSelOp]           = useState("");
  const [selShip, setSelShip]       = useState("");
  const [acting, setActing]         = useState(false);

  useEffect(() => {
    if (!user || !["ADMIN","STAFF"].includes(user.role)) { navigate("/"); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const ordRes = await api.get("/staff/orders");
      setOrders(Array.isArray(ordRes.data) ? ordRes.data : []);
    } catch (e) { console.error("Loi fetch orders:", e); }
    finally { setLoading(false); }

    try {
      const accRes = await api.get("/admin/accounts");
      const accs  = Array.isArray(accRes.data) ? accRes.data : [];
      const ops   = accs.filter(a => a.role === "OPERATION");
      const ships = accs.filter(a => a.role === "SHIPPER");
      setOperations(ops);
      setShippers(ships);
      if (ops.length > 0)   setSelOp(String(ops[0].accountId));
      if (ships.length > 0) setSelShip(String(ships[0].accountId));
    } catch (e) {
      try {
        const accRes = await api.get("/staff/accounts");
        const accs  = Array.isArray(accRes.data) ? accRes.data : [];
        const ops   = accs.filter(a => a.role === "OPERATION");
        const ships = accs.filter(a => a.role === "SHIPPER");
        setOperations(ops);
        setShippers(ships);
        if (ops.length > 0)   setSelOp(String(ops[0].accountId));
        if (ships.length > 0) setSelShip(String(ships[0].accountId));
      } catch (_) {}
    }
  };

  const act = async (url, body, msg) => {
    setActing(true);
    try {
      await api.put(url, body);
      alert(msg || "Thanh cong!");
      await fetchAll();
      setSelected(null);
    } catch (e) { alert("Loi: " + (e.response?.data?.message || e.message)); }
    finally { setActing(false); }
  };

  const fmt     = n => new Intl.NumberFormat("vi-VN", { style:"currency", currency:"VND" }).format(n || 0);
  const fmtDate = d => d ? new Date(d).toLocaleString("vi-VN") : "";
  const filtered = filter === "ALL" ? orders : orders.filter(o => o.status === filter);

  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <div style={S.navInner}>
          <div style={S.logo} onClick={() => navigate("/")}>👓 GlassesShop</div>
          <span style={{ color:"rgba(255,255,255,0.85)", fontWeight:600, fontSize:14 }}>
            🧾 Staff — Quan ly don hang
          </span>
          <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
            {user.role === "ADMIN" && (
              <button style={S.navBtn} onClick={() => navigate("/admin")}>Admin Panel</button>
            )}
            <button style={S.navBtnUser}>{user?.name?.split(" ").pop() || user?.username}</button>
            <button style={S.navBtnLogout} onClick={() => { logout(); navigate("/"); }}>Dang xuat</button>
          </div>
        </div>
      </nav>

      <div style={S.container}>
        {/* STATS */}
        <div style={S.statsRow}>
          {[
            { label:"Tong don",   value: orders.length,                                           color:"#3b82f6" },
            { label:"Cho XN",     value: orders.filter(o => o.status === "PENDING").length,       color:"#f59e0b" },
            { label:"Da XN",      value: orders.filter(o => o.status === "CONFIRMED").length,     color:"#2563eb" },
            { label:"San xuat",   value: orders.filter(o => o.status === "MANUFACTURING").length, color:"#7c3aed" },
            { label:"Dang giao",  value: orders.filter(o => o.status === "SHIPPING").length,      color:"#0891b2" },
            { label:"Hoan thanh", value: orders.filter(o => o.status === "DELIVERED").length,     color:"#16a34a" },
          ].map(s => (
            <div key={s.label} style={{ ...S.statBox, borderLeft:"4px solid "+s.color }}>
              <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:11, color:"#888", marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns: selected ? "1fr 400px" : "1fr", gap:16, alignItems:"start" }}>
          {/* DANH SÁCH */}
          <div style={S.listPanel}>
            <div style={S.filterRow}>
              {FILTER_BTNS.map(f => {
                const sc = STATUS_COLORS[f];
                const count = f === "ALL" ? orders.length : orders.filter(o => o.status === f).length;
                return (
                  <button key={f} onClick={() => setFilter(f)}
                    style={{ padding:"5px 12px", border:"none", borderRadius:4, cursor:"pointer",
                      fontSize:12, fontWeight: filter === f ? 700 : 500,
                      background: filter === f ? (sc?.bg || "#fee2e2") : "#f5f5f5",
                      color: filter === f ? (sc?.color || "#ee4d2d") : "#666" }}>
                    {sc?.label || "Tat ca"} ({count})
                  </button>
                );
              })}
              <button style={{ marginLeft:"auto", padding:"5px 12px", background:"#f5f5f5", border:"none", borderRadius:4, fontSize:12, cursor:"pointer" }}
                onClick={fetchAll}>↻ Tai lai</button>
            </div>

            {loading ? <Spinner /> : filtered.length === 0 ? (
              <div style={{ textAlign:"center", padding:60, color:"#aaa" }}>Khong co don hang nao.</div>
            ) : (
              <div style={{ maxHeight:"calc(100vh - 260px)", overflow:"auto" }}>
                {filtered.map(o => {
                  const sc = STATUS_COLORS[o.status] || { bg:"#f3f4f6", color:"#666", label:o.status };
                  return (
                    <div key={o.orderId}
                      style={{ ...S.orderCard, ...(selected?.orderId === o.orderId ? S.orderCardActive : {}) }}
                      onClick={() => setSelected(o)}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                        <span style={{ fontWeight:700, fontSize:14 }}>Don #{o.orderId}</span>
                        <span style={{ ...S.badge, background:sc.bg, color:sc.color }}>{sc.label}</span>
                      </div>
                      <div style={{ fontSize:12, color:"#666", marginBottom:4 }}>
                        KH: <strong>{o.customerName || "ID "+o.customerId}</strong>
                        {" · "}{o.shippingAddress}
                      </div>
                      {(o.items || []).length > 0 && (
                        <div style={{ fontSize:12, color:"#888", marginBottom:6 }}>
                          {o.items.slice(0,2).map((item, i) => (
                            <span key={i} style={{ marginRight:8 }}>
                              {TYPE_ICON[item.productType] || "📦"} {item.productName || "San pham"}{item.quantity > 1 ? " x"+item.quantity : ""}
                            </span>
                          ))}
                          {o.items.length > 2 && <span style={{ color:"#ccc" }}>+{o.items.length-2} sp nua</span>}
                        </div>
                      )}
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{ fontWeight:700, color:"#ee4d2d" }}>{fmt(o.finalAmount)}</span>
                        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                          <span style={{ fontSize:11, color: o.paymentStatus === "PAID" ? "#16a34a" : "#f59e0b", fontWeight:600 }}>
                            {o.paymentStatus === "PAID" ? "✅ Da TT" : "⏳ Chua TT"}
                          </span>
                          <span style={{ fontSize:11, color:"#aaa" }}>
                            {o.orderDate ? new Date(o.orderDate).toLocaleDateString("vi-VN") : ""}
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
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, paddingBottom:12, borderBottom:"1px solid #f0f0f0" }}>
                <h3 style={{ fontSize:15, fontWeight:700 }}>Don hang #{selected.orderId}</h3>
                <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", fontSize:18, cursor:"pointer", color:"#aaa" }}>✕</button>
              </div>

              {/* Badge trạng thái */}
              {(() => {
                const sc = STATUS_COLORS[selected.status];
                return (
                  <div style={{ marginBottom:14 }}>
                    <span style={{ ...S.badge, background:sc?.bg||"#f3f4f6", color:sc?.color||"#666", fontSize:12, padding:"4px 12px" }}>
                      {sc?.label || selected.status}
                    </span>
                  </div>
                );
              })()}

              {/* Thông tin đơn */}
              <div style={S.infoBox}>
                <div style={S.infoTitle}>THONG TIN DON HANG</div>
                {[
                  ["Khach hang",  selected.customerName || "ID "+selected.customerId],
                  ["Dia chi giao", selected.shippingAddress],
                  ["Phuong thuc", selected.paymentMethod === "COD" ? "Tien mat (COD)" : "Chuyen khoan"],
                  ["Thanh toan",  selected.paymentStatus === "PAID" ? "✅ Da thanh toan" : "⏳ Chua thanh toan"],
                  ["Tam tinh",    fmt(selected.totalAmount)],
                  ["Giam gia",    selected.discountCode ? selected.discountCode + " (-" + fmt((selected.totalAmount||0) - (selected.finalAmount||0)) + ")" : "Khong"],
                  ["Tong cong",   fmt(selected.finalAmount)],
                  ["Ngay dat",    fmtDate(selected.orderDate)],
                ].map(([l, v]) => (
                  <div key={l} style={S.infoRow}>
                    <span style={S.infoLabel}>{l}</span>
                    <span style={S.infoValue}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Sản phẩm */}
              {(selected.items || []).length > 0 && (
                <div style={{ marginBottom:14 }}>
                  <div style={S.infoTitle}>SAN PHAM ({selected.items.length})</div>
                  {selected.items.map((item, i) => (
                    <div key={i} style={S.itemCard}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                          <span style={{ fontSize:20 }}>{TYPE_ICON[item.productType] || "📦"}</span>
                          <div>
                            <div style={{ fontWeight:600, fontSize:13 }}>{item.productName || "San pham"}</div>
                            <span style={S.typeBadge}>{TYPE_LABEL[item.productType] || item.productType}</span>
                          </div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontWeight:700, color:"#ee4d2d", fontSize:13 }}>{fmt((item.price||0) * (item.quantity||1))}</div>
                          <div style={{ fontSize:11, color:"#aaa" }}>x{item.quantity} · {fmt(item.price)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Hành động */}
              <div style={S.infoTitle}>HANH DONG</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:8 }}>

                {/* PENDING → Xác nhận */}
                {selected.status === "PENDING" && (
                  <button style={{ ...S.actionBtn, background:"#2563eb" }} disabled={acting}
                    onClick={() => act("/staff/orders/"+selected.orderId+"/confirm", {}, "Da xac nhan don hang #"+selected.orderId+"!")}>
                    ✅ Xac nhan don hang
                  </button>
                )}

                {/* CONFIRMED → Assign Operation */}
                {selected.status === "CONFIRMED" && (
                  <div style={S.assignBox}>
                    <div style={S.assignLabel}>Giao cho bo phan san xuat (Operation):</div>
                    {operations.length === 0 ? (
                      <div style={{ color:"#dc2626", fontSize:12 }}>⚠️ Khong co nhan vien Operation!</div>
                    ) : (
                      <div style={{ display:"flex", gap:8 }}>
                        <select value={selOp} onChange={e => setSelOp(e.target.value)} style={S.select}>
                          {operations.map(op => (
                            <option key={op.accountId} value={op.accountId}>
                              {op.name || op.username} ({op.username})
                            </option>
                          ))}
                        </select>
                        <button style={{ ...S.actionBtn, background:"#7c3aed", whiteSpace:"nowrap" }} disabled={acting || !selOp}
                          onClick={() => act("/staff/orders/"+selected.orderId+"/assign-operation", { accountId:parseInt(selOp) }, "Da giao cho Operation!")}>
                          Giao SX
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* MANUFACTURING → Chờ Operation hoàn thành, nút bị khoá */}
                {selected.status === "MANUFACTURING" && (
                  <div style={{ background:"#faf5ff", border:"1px solid #ede9fe", borderRadius:6, padding:12, fontSize:13, color:"#7c3aed" }}>
                    🏭 Dang san xuat — Cho Operation hoan thanh truoc khi giao ship.
                  </div>
                )}

               {/* SHIPPING → Assign Shipper nếu chưa assign */}
{selected.status === "SHIPPING" && !selected.shipperAssigned && (
  <div style={S.assignBox}>
    <div style={S.assignLabel}>Phan cong Shipper giao hang:</div>
    {shippers.length === 0 ? (
      <div style={{ color:"#dc2626", fontSize:12 }}>⚠️ Khong co Shipper nao!</div>
    ) : (
      <div style={{ display:"flex", gap:8 }}>
        <select value={selShip} onChange={e => setSelShip(e.target.value)} style={S.select}>
          {shippers.map(s => (
            <option key={s.accountId} value={s.accountId}>
              {s.name || s.username} ({s.username})
            </option>
          ))}
        </select>
        <button style={{ ...S.actionBtn, background:"#0891b2", whiteSpace:"nowrap" }} disabled={acting || !selShip}
          onClick={() => act("/staff/orders/"+selected.orderId+"/assign-shipper", { accountId:parseInt(selShip) }, "Da phan cong Shipper!")}>
          Giao Ship
        </button>
      </div>
    )}
  </div>
)}

{/* SHIPPING → Đã assign rồi, chỉ hiện thông báo */}
{selected.status === "SHIPPING" && selected.shipperAssigned && (
  <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:6, padding:12, fontSize:13, color:"#16a34a", fontWeight:600 }}>
    ✅ Da phan cong Shipper — Dang cho giao hang.
  </div>
)}

                {/* RETURN_PENDING → Xử lý hoàn hàng */}
                {selected.status === "RETURN_PENDING" && (
                  <button style={{ ...S.actionBtn, background:"#db2777" }} disabled={acting}
                    onClick={() => act("/staff/orders/"+selected.orderId+"/return", {}, "Da xu ly hoan hang don #"+selected.orderId+"!")}>
                    🔄 Xu ly hoan hang
                  </button>
                )}

                {/* DELIVERED / CANCELLED → chỉ xem */}
                {["DELIVERED","CANCELLED"].includes(selected.status) && (
                  <div style={{ background:"#f9fafb", borderRadius:6, padding:12, fontSize:13, color:"#888", textAlign:"center" }}>
                    {selected.status === "DELIVERED" && "✅ Don hang da giao thanh cong."}
                    {selected.status === "CANCELLED" && "❌ Don hang da bi huy."}
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
      <div style={{ display:"inline-block", width:32, height:32, border:"3px solid #f0f0f0", borderTopColor:"#ee4d2d", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const S = {
  page:         { minHeight:"100vh", background:"#f5f5f5", fontFamily:"system-ui,sans-serif" },
  nav:          { background:"#ee4d2d", height:56, boxShadow:"0 2px 8px rgba(0,0,0,0.15)", position:"sticky", top:0, zIndex:100 },
  navInner:     { maxWidth:1200, margin:"0 auto", height:"100%", padding:"0 16px", display:"flex", alignItems:"center", gap:16 },
  logo:         { fontSize:18, fontWeight:800, color:"white", cursor:"pointer", flexShrink:0 },
  navBtn:       { background:"rgba(255,255,255,0.2)", border:"none", borderRadius:4, color:"white", fontSize:13, cursor:"pointer", padding:"6px 12px" },
  navBtnUser:   { background:"rgba(255,255,255,0.2)", border:"none", borderRadius:4, color:"white", fontSize:13, fontWeight:600, cursor:"pointer", padding:"6px 12px" },
  navBtnLogout: { background:"rgba(0,0,0,0.15)", border:"none", borderRadius:4, color:"white", fontSize:13, cursor:"pointer", padding:"6px 12px" },
  container:    { maxWidth:1200, margin:"0 auto", padding:"20px 16px" },
  statsRow:     { display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" },
  statBox:      { background:"white", borderRadius:6, padding:"12px 14px", flex:1, minWidth:90, boxShadow:"0 1px 4px rgba(0,0,0,0.07)" },
  listPanel:    { background:"white", borderRadius:8, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" },
  filterRow:    { display:"flex", gap:6, padding:"12px 14px", borderBottom:"1px solid #f0f0f0", flexWrap:"wrap" },
  orderCard:    { padding:"14px 16px", borderBottom:"1px solid #f9fafb", cursor:"pointer", transition:"background 0.1s" },
  orderCardActive: { background:"#fff5f5", borderLeft:"3px solid #ee4d2d" },
  badge:        { padding:"3px 8px", borderRadius:999, fontSize:11, fontWeight:600 },
  detailPanel:  { background:"white", borderRadius:8, padding:18, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", position:"sticky", top:76, maxHeight:"calc(100vh - 100px)", overflow:"auto" },
  infoBox:      { background:"#fafafa", borderRadius:6, padding:12, marginBottom:12 },
  infoTitle:    { fontSize:11, fontWeight:700, color:"#aaa", letterSpacing:0.5, marginBottom:8 },
  infoRow:      { display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6 },
  infoLabel:    { color:"#888" },
  infoValue:    { fontWeight:600, maxWidth:"60%", textAlign:"right", wordBreak:"break-word" },
  itemCard:     { background:"#fafafa", borderRadius:6, padding:"10px 12px", marginBottom:8, border:"1px solid #f0f0f0" },
  typeBadge:    { padding:"2px 7px", background:"#fef3c7", color:"#d97706", borderRadius:4, fontSize:10, fontWeight:600 },
  assignBox:    { background:"#f8faff", border:"1px solid #e0e7ff", borderRadius:6, padding:12 },
  assignLabel:  { fontSize:12, fontWeight:600, color:"#555", marginBottom:8 },
  select:       { flex:1, padding:"7px 10px", border:"1px solid #e5e7eb", borderRadius:4, fontSize:13, outline:"none" },
  actionBtn:    { padding:"11px", color:"white", border:"none", borderRadius:6, fontSize:13, fontWeight:600, cursor:"pointer" },
};