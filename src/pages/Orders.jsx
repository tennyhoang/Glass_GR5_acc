import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../services/authService";
import api from "../services/api";

const STATUS_MAP = {
  PENDING: { label: "Cho xac nhan", color: "#d97706", bg: "#fef3c7", step: 0 },
  CONFIRMED: { label: "Da xac nhan", color: "#2563eb", bg: "#dbeafe", step: 1 },
  MANUFACTURING: { label: "Dang san xuat", color: "#7c3aed", bg: "#ede9fe", step: 2 },
  SHIPPING: { label: "Dang giao hang", color: "#0891b2", bg: "#cffafe", step: 3 },
  DELIVERED: { label: "Da giao hang", color: "#16a34a", bg: "#dcfce7", step: 4 },
  CANCELLED: { label: "Da huy", color: "#dc2626", bg: "#fee2e2", step: -1 },
  RETURN_PENDING: { label: "Cho hoan hang", color: "#db2777", bg: "#fce7f3", step: -1 },
};

const STEPS = ["Cho xac nhan", "Da xac nhan", "Dang san xuat", "Dang giao", "Da giao"];

export default function Orders() {
  const navigate = useNavigate();
  const user = getUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [itemDetails, setItemDetails] = useState({});

  // Banking payment states
  const [showPayModal, setShowPayModal] = useState(false);
  const [payOrder, setPayOrder] = useState(null);
  const [payInfo, setPayInfo] = useState(null);
  const [fakePaying, setFakePaying] = useState(false);
  const [fakePaid, setFakePaid] = useState(false);
  const [fakeTxnId, setFakeTxnId] = useState("");
  const [fakeForm, setFakeForm] = useState({ accountNumber: "", accountName: "" });

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders/my-orders");
      const data = Array.isArray(res.data) ? res.data : [];
      setOrders(data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // Fetch chi tiết sản phẩm cho từng item trong đơn
  const fetchItemDetails = async (order) => {
    const details = {};
    const items = order.items || [];
    await Promise.all(items.map(async (item) => {
      try {
        const ep = getDetailEndpoint(item.productType, item.productId);
        if (!ep) return;
        const r = await api.get(ep);
        details[item.productId + "_" + item.productType] = r.data;
      } catch (e) { /* skip */ }
    }));
    setItemDetails(details);
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

  const handleSelectOrder = (order) => {
    setSelected(order);
    fetchItemDetails(order);
  };

  const handleCancel = async (orderId) => {
    const order = orders.find(o => o.orderId === orderId);
    const isPaid = order?.paymentStatus === "PAID";
    const isBanking = order?.paymentMethod === "BANKING";

    // ✅ Hiển thị thông báo phù hợp theo trạng thái thanh toán
    let confirmMsg = "Ban chac chan muon huy don hang #" + orderId + "?\n\n";
    if (isPaid && isBanking) {
      confirmMsg += "⚠️ Don hang nay da duoc thanh toan bang chuyen khoan.\n";
      confirmMsg += "Tien se duoc HOAN TRA ve tai khoan cua ban trong 3-5 ngay lam viec.\n\n";
      confirmMsg += "Nhan OK de xac nhan huy va yeu cau hoan tien.";
    } else if (!isPaid && isBanking) {
      confirmMsg += "Don hang chua duoc thanh toan.\n";
      confirmMsg += "Huy don hang se KHONG mat tien vi ban chua chuyen khoan.\n\n";
      confirmMsg += "Nhan OK de xac nhan huy.";
    } else {
      confirmMsg += "Don hang COD se bi huy.\n";
      confirmMsg += "Nhan OK de xac nhan huy.";
    }

    if (!window.confirm(confirmMsg)) return;
    setCancellingId(orderId);
    try {
      await api.put("/orders/" + orderId + "/cancel");
      setOrders(prev => prev.map(o =>
        o.orderId === orderId ? { ...o, status: "CANCELLED", paymentStatus: isPaid ? "REFUNDED" : "CANCELLED" } : o
      ));
      if (selected?.orderId === orderId) {
        setSelected(prev => ({ ...prev, status: "CANCELLED", paymentStatus: isPaid ? "REFUNDED" : "CANCELLED" }));
      }

      // ✅ Thông báo sau khi hủy
      if (isPaid && isBanking) {
        alert(
          "✅ Da huy don hang #" + orderId + " thanh cong!\n\n" +
          "💰 HOAN TIEN:\n" +
          "So tien: " + new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.finalAmount) + "\n" +
          "Hinh thuc: Chuyen khoan ve tai khoan goc\n" +
          "Thoi gian: 3-5 ngay lam viec\n\n" +
          "Vui long kiem tra tai khoan ngan hang cua ban."
        );
      } else {
        alert("✅ Da huy don hang #" + orderId + " thanh cong!");
      }
    } catch (e) { alert("Loi: " + (e.response?.data?.message || e.message)); }
    finally { setCancellingId(null); }
  };

  const handleOpenPay = async (order) => {
    setPayOrder(order);
    setFakePaid(false);
    setFakeForm({ accountNumber: "", accountName: "" });
    setFakeTxnId("");
    try {
      const res = await api.get("/payment/order/" + order.orderId);
      setPayInfo(res.data);
    } catch (e) { setPayInfo({ paidAmount: order.finalAmount }); }
    setShowPayModal(true);
  };

  const handleFakeTransfer = async () => {
    if (!fakeForm.accountNumber.trim() || !fakeForm.accountName.trim()) {
      alert("Vui long nhap day du thong tin!"); return;
    }
    setFakePaying(true);
    try {
      await new Promise(r => setTimeout(r, 2500));
      await api.post("/payment/confirm/" + payOrder.orderId);
      setFakeTxnId("TXN" + Date.now().toString().slice(-8).toUpperCase());
      setFakePaid(true);
      setOrders(prev => prev.map(o =>
        o.orderId === payOrder.orderId ? { ...o, paymentStatus: "PAID" } : o
      ));
      if (selected?.orderId === payOrder.orderId) {
        setSelected(prev => ({ ...prev, paymentStatus: "PAID" }));
      }
    } catch (e) { alert("Loi: " + (e.response?.data?.message || e.message)); }
    finally { setFakePaying(false); }
  };

  const fmt = n => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);
  const fmtDate = d => d ? new Date(d).toLocaleString("vi-VN") : "";
  const needsPay = (order) =>
    order.paymentMethod === "BANKING" && order.paymentStatus === "PENDING" && order.status !== "CANCELLED";

  const getTypeIcon = (type) => ({ READY_MADE: "👓", CONTACT_LENS: "🔵", MY_GLASSES: "🎨", FRAME: "🕶️", LENS: "🔍" }[type] || "📦");
  const getTypeLabel = (type) => ({ READY_MADE: "Kinh co san", CONTACT_LENS: "Kinh ap trong", MY_GLASSES: "Kinh thiet ke", FRAME: "Gong kinh", LENS: "Trong kinh" }[type] || type);

  const getItemDetailRows = (item) => {
    const d = itemDetails[item.productId + "_" + item.productType];
    if (!d) return [];
    switch (item.productType) {
      case "READY_MADE": return [
        ["Thuong hieu", d.brand], ["Do cau", d.fixedSph], ["Do tru", d.fixedCyl],
        ["Ton kho", d.stock], ["Trang thai", d.status === "ACTIVE" ? "Con hang" : "Het hang"],
      ].filter(([, v]) => v != null);
      case "CONTACT_LENS": return [
        ["Loai kinh", d.contactType], ["Mau sac", d.color],
        ["SPH", d.minSph + " ~ " + d.maxSph], ["Ton kho", d.stock],
      ].filter(([, v]) => v != null);
      case "FRAME": return [
        ["Thuong hieu", d.brand], ["Chat lieu", d.material],
        ["Kich co", d.size], ["Mau", d.color], ["Kieu", d.rimType],
      ].filter(([, v]) => v != null);
      case "LENS": return [
        ["Loai trong", d.lensType], ["SPH", d.minSph + " ~ " + d.maxSph],
        ["Doi mau", d.colorChange ? "Co" : "Khong"],
      ].filter(([, v]) => v != null);
      default: return [];
    }
  };

  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <div style={S.navInner}>
          <div style={S.logo} onClick={() => navigate("/")}>👓 GlassesShop</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button style={S.navBtn} onClick={() => navigate("/")}>Trang chu</button>
            <button style={S.navBtn} onClick={() => navigate("/cart")}>Gio hang</button>
            <button style={S.navBtnUser}>{user?.name?.split(" ").pop() || user?.username}</button>
          </div>
        </div>
      </nav>

      <div style={S.container}>
        <h2 style={S.pageTitle}>Don Hang Cua Toi</h2>

        {loading ? <Spinner /> : orders.length === 0 ? (
          <div style={S.empty}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
            <h3>Ban chua co don hang nao</h3>
            <button style={S.btnPrimary} onClick={() => navigate("/")}>Mua sam ngay</button>
          </div>
        ) : (
          <div style={S.layout}>
            {/* DANH SÁCH ĐƠN */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {orders.map(order => {
                const st = STATUS_MAP[order.status] || { label: order.status, color: "#666", bg: "#f3f4f6" };
                const unpaid = needsPay(order);
                return (
                  <div key={order.orderId}
                    style={{ ...S.orderCard, ...(selected?.orderId === order.orderId ? S.orderCardActive : {}) }}
                    onClick={() => handleSelectOrder(order)}>
                    <div style={S.cardTop}>
                      <div>
                        <span style={S.orderId}>Don hang #{order.orderId}</span>
                        <span style={{ fontSize: 12, color: "#aaa", marginLeft: 8 }}>{fmtDate(order.orderDate)}</span>
                      </div>
                      <span style={{ ...S.badge, background: st.bg, color: st.color }}>{st.label}</span>
                    </div>

                    {/* Tóm tắt sản phẩm */}
                    {(order.items || []).length > 0 && (
                      <div style={{ fontSize: 12, color: "#666", margin: "6px 0", padding: "6px 0", borderTop: "1px solid #f5f5f5" }}>
                        {order.items.slice(0, 2).map((item, i) => (
                          <span key={i} style={{ marginRight: 8 }}>
                            {getTypeIcon(item.productType)} {item.productName || "San pham"}{item.quantity > 1 ? " x" + item.quantity : ""}
                          </span>
                        ))}
                        {order.items.length > 2 && <span style={{ color: "#aaa" }}>+{order.items.length - 2} san pham khac</span>}
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#ee4d2d" }}>{fmt(order.finalAmount)}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: order.paymentStatus === "PAID" ? "#16a34a" : "#f59e0b" }}>
                        {order.paymentStatus === "PAID" ? "✅ Da thanh toan" : "⏳ Chua thanh toan"}
                      </span>
                    </div>

                    {unpaid && (
                      <div style={S.unpaidAlert}>
                        <span>🏦 Chua thanh toan — Don hang co the bi huy sau 24h</span>
                        <button style={S.btnPayNow}
                          onClick={e => { e.stopPropagation(); handleOpenPay(order); }}>
                          Thanh toan ngay
                        </button>
                      </div>
                    )}

                    {order.status === "PENDING" && (
                      <button style={S.btnCancel}
                        onClick={e => { e.stopPropagation(); handleCancel(order.orderId); }}
                        disabled={cancellingId === order.orderId}>
                        {cancellingId === order.orderId ? "Dang huy..." : "Huy don hang"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* CHI TIẾT ĐƠN */}
            {selected && (
              <div style={S.detailPanel}>
                <div style={S.detailHeader}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>Don hang #{selected.orderId}</h3>
                  <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#999" }}>✕</button>
                </div>

                {/* TRACKING */}
                {!["CANCELLED", "RETURN_PENDING"].includes(selected.status) && (
                  <div style={{ background: "#fafafa", borderRadius: 6, padding: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#888", marginBottom: 10 }}>TRANG THAI DON HANG</div>
                    {STEPS.map((stepLabel, i) => {
                      const st = STATUS_MAP[selected.status];
                      const done = st && i <= st.step;
                      const current = st && i === st.step;
                      return (
                        <div key={stepLabel} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 2 }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                            <div style={{ width: 14, height: 14, borderRadius: "50%", background: done ? "#ee4d2d" : "#e5e7eb", transform: current ? "scale(1.3)" : "scale(1)", transition: "all 0.3s" }} />
                            {i < STEPS.length - 1 && <div style={{ width: 2, height: 20, background: done ? "#ee4d2d" : "#e5e7eb", marginTop: 2 }} />}
                          </div>
                          <span style={{ fontSize: 12, fontWeight: current ? 700 : 400, color: done ? "#111" : "#ccc", lineHeight: "14px" }}>
                            {stepLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {["CANCELLED", "RETURN_PENDING"].includes(selected.status) && (
                  <div>
                    <div style={{ background: "#fee2e2", borderRadius: 6, padding: 12, marginBottom: 10, color: "#dc2626", fontWeight: 600, fontSize: 13 }}>
                      {selected.status === "CANCELLED" ? "❌ Don hang da bi huy" : "🔄 Dang xu ly hoan hang"}
                    </div>
                    {/* Thông báo hoàn tiền nếu đã thanh toán */}
                    {selected.paymentStatus === "REFUNDED" && (
                      <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: 14, marginBottom: 10 }}>
                        <div style={{ fontWeight: 700, color: "#92400e", fontSize: 14, marginBottom: 8 }}>
                          💰 Thong bao hoan tien
                        </div>
                        <div style={{ fontSize: 13, color: "#78350f", lineHeight: 1.6 }}>
                          <div>• So tien: <strong>{fmt(selected.finalAmount)}</strong></div>
                          <div>• Hinh thuc: Chuyen khoan ve tai khoan goc</div>
                          <div>• Thoi gian xu ly: <strong>3-5 ngay lam viec</strong></div>
                          <div style={{ marginTop: 8, color: "#92400e", fontSize: 12 }}>
                            Neu qua 5 ngay chua nhan duoc tien, vui long lien he hotline ho tro.
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Không mất tiền vì chưa thanh toán */}
                    {selected.paymentStatus === "CANCELLED" && selected.paymentMethod === "BANKING" && (
                      <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: 12, marginBottom: 10, fontSize: 13, color: "#166534" }}>
                        ✅ Ban khong mat tien vi don hang chua duoc thanh toan.
                      </div>
                    )}
                  </div>
                )}

                {/* THANH TOÁN */}
                {needsPay(selected) && (
                  <div style={S.payBox}>
                    <p style={{ fontWeight: 700, marginBottom: 10, color: "#92400e", fontSize: 14 }}>
                      🏦 Don hang chua duoc thanh toan
                    </p>
                    <p style={{ fontSize: 12, color: "#b45309", marginBottom: 10 }}>
                      Vui long hoan tat thanh toan de don hang duoc xu ly
                    </p>
                    <button style={S.btnPayBig} onClick={() => handleOpenPay(selected)}>
                      Thanh toan ngay — {fmt(selected.finalAmount)}
                    </button>
                  </div>
                )}

                {/* THÔNG TIN ĐƠN HÀNG */}
                <Section title="Thong tin don hang">
                  {[
                    ["Ma don hang", "#" + selected.orderId],
                    ["Ngay dat", fmtDate(selected.orderDate)],
                    ["Dia chi giao", selected.shippingAddress],
                    ["Phuong thuc TT", selected.paymentMethod === "BANKING" ? "Chuyen khoan ngan hang" : "Tien mat (COD)"],
                    ["Trang thai TT", selected.paymentStatus === "PAID" ? "✅ Da thanh toan" : "⏳ Chua thanh toan"],
                  ].map(([l, v]) => (
                    <InfoRow key={l} label={l} value={v} />
                  ))}
                </Section>

                {/* SẢN PHẨM CHI TIẾT */}
                <Section title={"San pham (" + (selected.items || []).length + ")"}>
                  {(selected.items || []).map((item, i) => {
                    const detailRows = getItemDetailRows(item);
                    const routeMap = { READY_MADE: "ready-made", CONTACT_LENS: "contact", FRAME: "frame", LENS: "lens" };
                    return (
                      <div key={i} style={S.orderItem}>
                        <div style={S.orderItemTop}>
                          <div style={S.orderItemIcon}>{getTypeIcon(item.productType)}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{item.productName || "San pham"}</div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                              <span style={S.typeBadge}>{getTypeLabel(item.productType)}</span>
                              <span style={{ fontSize: 12, color: "#888" }}>x{item.quantity}</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "#ee4d2d" }}>{fmt(item.price)}</span>
                            </div>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{fmt((item.price || 0) * (item.quantity || 1))}</div>
                        </div>

                        {/* Chi tiết sản phẩm */}
                        {detailRows.length > 0 && (
                          <div style={S.itemDetailBox}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 8 }}>THONG SO KY THUAT</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
                              {detailRows.map(([label, value]) => (
                                <div key={label} style={{ display: "flex", justifyContent: "space-between", background: "white", padding: "6px 8px", borderRadius: 4, border: "1px solid #e5e7eb" }}>
                                  <span style={{ fontSize: 11, color: "#888" }}>{label}</span>
                                  <span style={{ fontSize: 11, fontWeight: 600 }}>{String(value)}</span>
                                </div>
                              ))}
                            </div>
                            {routeMap[item.productType] && (
                              <button style={{ marginTop: 8, background: "none", border: "none", color: "#3b82f6", fontSize: 11, cursor: "pointer", padding: 0 }}
                                onClick={() => navigate("/product/" + routeMap[item.productType] + "/" + item.productId)}>
                                Xem trang san pham day du →
                              </button>
                            )}
                          </div>
                        )}
                        {item.productType === "MY_GLASSES" && (
                          <div style={{ ...S.itemDetailBox, color: "#888", fontSize: 12 }}>
                            Kinh thiet ke rieng theo yeu cau cua ban.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </Section>

                {/* TỔNG TIỀN */}
                <Section title="Chi tiet thanh toan">
                  <InfoRow label="Tam tinh" value={fmt(selected.totalAmount)} />
                  <InfoRow
                    label="Ma giam gia"
                    value={(() => {
                      // Tính số tiền đã giảm: ưu tiên discountAmount, fallback tính từ totalAmount - finalAmount
                      const saved = selected.discountAmount > 0
                        ? selected.discountAmount
                        : (selected.totalAmount - selected.finalAmount > 0
                          ? selected.totalAmount - selected.finalAmount
                          : 0);
                      // Hiển thị nếu có mã HOẶC có tiền giảm thực tế
                      const hasDiscount = selected.discountCode || saved > 0;
                      if (!hasDiscount) return "Khong ap dung";
                      const codeLabel = selected.discountCode ? selected.discountCode + " — " : "";
                      return codeLabel + "- " + fmt(saved);
                    })()}
                    valueColor={
                      (selected.discountCode || selected.totalAmount - selected.finalAmount > 0)
                        ? "#16a34a" : undefined
                    }
                  />
                  <InfoRow label="Phi van chuyen" value="Mien phi" valueColor="#16a34a" />
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: "2px solid #f0f0f0", marginTop: 8, fontWeight: 800, fontSize: 16 }}>
                    <span>Tong cong</span>
                    <span style={{ color: "#ee4d2d" }}>{fmt(selected.finalAmount)}</span>
                  </div>
                  {(() => {
                    const saved = selected.discountAmount > 0
                      ? selected.discountAmount
                      : (selected.totalAmount - selected.finalAmount > 0
                        ? selected.totalAmount - selected.finalAmount
                        : 0);
                    return saved > 0 ? (
                      <div style={{ background: "#dcfce7", borderRadius: 4, padding: "6px 10px", fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
                        Ban da tiet kiem duoc {fmt(saved)}!
                      </div>
                    ) : null;
                  })()}
                </Section>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL BANKING */}
      {showPayModal && (
        <div style={S.modalOverlay} onClick={e => e.target === e.currentTarget && !fakePaying && setShowPayModal(false)}>
          <div style={S.modalBox}>
            {!fakePaid ? (
              <>
                <div style={S.bankHeader}>
                  <span style={{ fontSize: 32 }}>🏦</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: "#1e40af" }}>GlassesBank Internet Banking</div>
                    <div style={{ fontSize: 11, color: "#888" }}>Cong thanh toan truc tuyen an toan</div>
                  </div>
                  <span style={S.demoBadge}>DEMO</span>
                </div>

                <div style={S.transferBox}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1e40af", marginBottom: 10 }}>THONG TIN NGUOI NHAN</div>
                  {[
                    ["Ngan hang", "VCB - Vietcombank"],
                    ["So tai khoan", "9999 9999 9999"],
                    ["Chu tai khoan", "GLASSES SHOP CO., LTD"],
                    ["So tien", fmt(payInfo?.paidAmount || payOrder?.finalAmount || 0)],
                    ["Noi dung", "Thanh toan don hang #" + payOrder?.orderId],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #dbeafe", fontSize: 13 }}>
                      <span style={{ color: "#6b7280" }}>{l}</span>
                      <span style={{ fontWeight: 600, color: l === "So tien" ? "#ee4d2d" : "#111" }}>{v}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#333", marginBottom: 12 }}>TAI KHOAN CUA BAN</div>
                  {[
                    { key: "accountNumber", label: "So tai khoan nguon *", placeholder: "VD: 1234 5678 9012" },
                    { key: "accountName", label: "Ten chu tai khoan *", placeholder: "VD: NGUYEN VAN A" },
                  ].map(f => (
                    <div key={f.key} style={{ marginBottom: 12 }}>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 5 }}>{f.label}</label>
                      <input style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                        placeholder={f.placeholder} value={fakeForm[f.key]} disabled={fakePaying}
                        onChange={e => setFakeForm({ ...fakeForm, [f.key]: f.key === "accountName" ? e.target.value.toUpperCase() : e.target.value })} />
                    </div>
                  ))}
                </div>

                <button style={{ width: "100%", padding: "13px", background: fakePaying ? "#93c5fd" : "#1d4ed8", color: "white", border: "none", borderRadius: 6, fontSize: 15, fontWeight: 700, cursor: fakePaying ? "not-allowed" : "pointer", marginBottom: 10 }}
                  onClick={handleFakeTransfer} disabled={fakePaying}>
                  {fakePaying ? "Dang xu ly giao dich..." : "Xac nhan chuyen khoan " + fmt(payInfo?.paidAmount || payOrder?.finalAmount || 0)}
                </button>

                {fakePaying && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ height: 5, background: "#e5e7eb", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "#1d4ed8", borderRadius: 999, animation: "fillBar 2.5s ease-out forwards" }} />
                    </div>
                    <p style={{ textAlign: "center", fontSize: 12, color: "#888", marginTop: 6 }}>Dang ket noi ngan hang...</p>
                  </div>
                )}

                <p style={{ textAlign: "center", fontSize: 11, color: "#aaa", marginBottom: 8 }}>🔒 Ma hoa 256-bit SSL • He thong demo</p>
                {!fakePaying && (
                  <button onClick={() => setShowPayModal(false)} style={{ width: "100%", padding: "10px", background: "transparent", color: "#888", border: "1px solid #ddd", borderRadius: 4, fontSize: 13, cursor: "pointer" }}>
                    Huy giao dich
                  </button>
                )}
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 60, marginBottom: 12 }}>✅</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Giao dich thanh cong!</h2>
                <div style={{ background: "#f8fafc", borderRadius: 6, padding: 16, marginBottom: 20, textAlign: "left" }}>
                  {[
                    ["Ma don hang", "#" + payOrder?.orderId],
                    ["Ma giao dich", fakeTxnId],
                    ["So tien", fmt(payInfo?.paidAmount || payOrder?.finalAmount || 0)],
                    ["Tai khoan", fakeForm.accountNumber],
                    ["Chu TK", fakeForm.accountName],
                    ["Trang thai", "✅ Thanh cong"],
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "7px 0", borderBottom: "1px solid #f0f0f0" }}>
                      <span style={{ color: "#888" }}>{l}</span>
                      <strong style={{ color: l === "So tien" ? "#16a34a" : l === "Ma giao dich" ? "#1d4ed8" : "#111" }}>{v}</strong>
                    </div>
                  ))}
                </div>
                <button style={{ padding: "12px 32px", background: "#ee4d2d", color: "white", border: "none", borderRadius: 4, fontSize: 15, fontWeight: 600, cursor: "pointer" }}
                  onClick={() => { setShowPayModal(false); fetchOrders(); }}>Dong</button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes fillBar{0%{width:0%}40%{width:50%}80%{width:85%}100%{width:95%}}`}</style>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 14, marginTop: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 10, letterSpacing: 0.5 }}>{title.toUpperCase()}</div>
      {children}
    </div>
  );
}

function InfoRow({ label, value, valueColor }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
      <span style={{ color: "#888" }}>{label}</span>
      <span style={{ fontWeight: 500, color: valueColor || "#333", maxWidth: "60%", textAlign: "right" }}>{value}</span>
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
  pageTitle: { fontSize: 22, fontWeight: 800, marginBottom: 20 },
  empty: { textAlign: "center", padding: 80 },
  layout: { display: "grid", gridTemplateColumns: "1fr 400px", gap: 20, alignItems: "start" },
  orderCard: { background: "white", borderRadius: 8, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", cursor: "pointer", border: "2px solid transparent", transition: "all 0.15s" },
  orderCardActive: { border: "2px solid #ee4d2d" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  orderId: { fontWeight: 700, fontSize: 15 },
  badge: { padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" },
  unpaidAlert: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 10, fontSize: 12, color: "#92400e", flexWrap: "wrap" },
  btnPayNow: { padding: "6px 14px", background: "#1d4ed8", color: "white", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" },
  btnCancel: { marginTop: 10, padding: "5px 12px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: "pointer" },
  btnPrimary: { marginTop: 16, padding: "12px 28px", background: "#ee4d2d", color: "white", border: "none", borderRadius: 4, fontSize: 15, fontWeight: 600, cursor: "pointer" },
  detailPanel: { background: "white", borderRadius: 8, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", position: "sticky", top: 76, maxHeight: "calc(100vh - 100px)", overflow: "auto" },
  detailHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #f0f0f0" },
  payBox: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: 14, marginBottom: 14 },
  btnPayBig: { width: "100%", padding: "11px", background: "#1d4ed8", color: "white", border: "none", borderRadius: 4, fontSize: 14, fontWeight: 700, cursor: "pointer" },
  orderItem: { marginBottom: 12, padding: 12, background: "#fafafa", borderRadius: 6, border: "1px solid #f0f0f0" },
  orderItemTop: { display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 },
  orderItemIcon: { width: 40, height: 40, background: "#fff5f5", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 },
  typeBadge: { padding: "2px 7px", background: "#fef3c7", color: "#d97706", borderRadius: 4, fontSize: 10, fontWeight: 600 },
  itemDetailBox: { background: "#f0f4ff", borderRadius: 4, padding: 10, marginTop: 6, border: "1px solid #e0e7ff" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 },
  modalBox: { background: "white", borderRadius: 10, padding: 24, width: "100%", maxWidth: 460, maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" },
  bankHeader: { display: "flex", alignItems: "center", gap: 12, paddingBottom: 14, borderBottom: "2px solid #e2e8f0", marginBottom: 16 },
  demoBadge: { marginLeft: "auto", background: "#fef3c7", color: "#92400e", padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 },
  transferBox: { background: "#eff6ff", borderRadius: 6, padding: 14, marginBottom: 16 },
};