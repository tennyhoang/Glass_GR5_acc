import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../services/authService";
import api from "../services/api";

export default function Checkout() {
  const navigate = useNavigate();
  const user = getUser();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderDone, setOrderDone] = useState(null);
  const [form, setForm] = useState({
    shippingAddress: user?.address || "",
    paymentMethod: "COD",
    discountCode: "",
  });

  // Fake banking states
  const [fakePaying, setFakePaying] = useState(false);
  const [fakePaid, setFakePaid] = useState(false);
  const [fakeTxnId, setFakeTxnId] = useState("");
  const [fakeForm, setFakeForm] = useState({ accountNumber: "", accountName: "" });

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    api.get("/cart")
      .then(r => setCart(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const items = cart?.items || [];
  const subtotal = items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);
  const formatVND = (n) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

  const handleSubmit = async () => {
    if (!form.shippingAddress.trim()) { alert("Vui lòng nhập địa chỉ giao hàng!"); return; }
    if (items.length === 0) { alert("Giỏ hàng trống!"); return; }
    setSubmitting(true);
    try {
      const orderRes = await api.post("/orders/place", {
        shippingAddress: form.shippingAddress,
        paymentMethod: form.paymentMethod,
        ...(form.discountCode ? { discountCode: form.discountCode } : {}),
      });
      const order = orderRes.data;
      let payment = null;
      if (form.paymentMethod === "BANKING") {
        const payRes = await api.get(`/payment/order/${order.orderId}`);
        payment = payRes.data;
      }
      setOrderDone({ order, payment });
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Giả lập chuyển khoản như PayPal Sandbox
  const handleFakeTransfer = async () => {
    if (!fakeForm.accountNumber.trim() || !fakeForm.accountName.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin tài khoản!");
      return;
    }
    setFakePaying(true);
    try {
      // Delay giả lập xử lý ngân hàng 2.5 giây
      await new Promise(resolve => setTimeout(resolve, 2500));
      await api.post(`/payment/confirm/${orderDone.order.orderId}`);
      setFakeTxnId("TXN" + Date.now().toString().slice(-8).toUpperCase());
      setFakePaid(true);
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setFakePaying(false);
    }
  };

  // ===== COD SUCCESS =====
  if (orderDone && form.paymentMethod === "COD") {
    return (
      <div style={S.page}>
        <nav style={S.nav}>
          <div style={S.navLogo} onClick={() => navigate("/")}>👓 GlassesShop</div>
        </nav>
        <div style={S.centerWrap}>
          <div style={S.successCard}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>✅</div>
            <h2 style={S.successTitle}>Đặt hàng thành công!</h2>
            <p style={{ color: "#666", marginBottom: 20 }}>
              Mã đơn hàng: <strong>#{orderDone.order.orderId}</strong>
            </p>
            <div style={S.codBox}>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#16a34a" }}>💵 Thanh toán khi nhận hàng</p>
              <p style={{ color: "#666", fontSize: 14, margin: "8px 0" }}>Chuẩn bị đúng số tiền khi nhận</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: "#16a34a" }}>{formatVND(orderDone.order.finalAmount)}</p>
            </div>
            <button style={S.btnRed} onClick={() => navigate("/orders")}>Xem đơn hàng</button>
          </div>
        </div>
      </div>
    );
  }

  // ===== BANKING - Giả lập chuyển khoản =====
  if (orderDone && form.paymentMethod === "BANKING") {
    return (
      <div style={S.page}>
        <nav style={S.nav}>
          <div style={S.navLogo} onClick={() => navigate("/")}>👓 GlassesShop</div>
          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>🔒 Kết nối bảo mật SSL</span>
        </nav>
        <div style={S.centerWrap}>
          {!fakePaid ? (
            <div style={S.bankCard}>
              {/* HEADER */}
              <div style={S.bankHeader}>
                <span style={{ fontSize: 36 }}>🏦</span>
                <div>
                  <p style={S.bankName}>GlassesBank Internet Banking</p>
                  <p style={S.bankSub}>Cổng thanh toán trực tuyến an toàn</p>
                </div>
                <span style={S.demoBadge}>DEMO</span>
              </div>

              {/* THÔNG TIN NGƯỜI NHẬN */}
              <div style={S.infoBox}>
                <h4 style={S.boxTitle}>📋 Thông tin người nhận</h4>
                {[
                  ["Ngân hàng", "VCB - Vietcombank"],
                  ["Số tài khoản", "9999 9999 9999"],
                  ["Chủ tài khoản", "GLASSES SHOP CO., LTD"],
                  ["Số tiền", formatVND(orderDone.payment?.paidAmount || 0)],
                  ["Nội dung CK", `Thanh toan don hang #${orderDone.order.orderId}`],
                ].map(([label, value]) => (
                  <div key={label} style={S.infoRow}>
                    <span style={S.infoLabel}>{label}</span>
                    <span style={{
                      ...S.infoValue,
                      color: label === "Số tiền" ? "#ee4d2d" : "#111",
                      fontSize: label === "Số tiền" ? 16 : 14,
                    }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* FORM NGƯỜI GỬI */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={S.boxTitle}>👤 Tài khoản của bạn</h4>
                {[
                  { key: "accountNumber", label: "Số tài khoản nguồn *", placeholder: "VD: 1234 5678 9012" },
                  { key: "accountName", label: "Tên chủ tài khoản *", placeholder: "VD: NGUYEN VAN A" },
                ].map((f) => (
                  <div key={f.key} style={{ marginBottom: 12 }}>
                    <label style={S.fieldLabel}>{f.label}</label>
                    <input style={S.fieldInput}
                      placeholder={f.placeholder}
                      value={fakeForm[f.key]}
                      disabled={fakePaying}
                      onChange={(e) => setFakeForm({
                        ...fakeForm,
                        [f.key]: f.key === "accountName"
                          ? e.target.value.toUpperCase()
                          : e.target.value
                      })} />
                  </div>
                ))}
              </div>

              {/* NÚT CHUYỂN KHOẢN */}
              <button
                style={{ ...S.btnTransfer, opacity: fakePaying ? 0.8 : 1 }}
                onClick={handleFakeTransfer}
                disabled={fakePaying}>
                {fakePaying
                  ? "⏳ Đang xử lý giao dịch..."
                  : `💸 Chuyển khoản ${formatVND(orderDone.payment?.paidAmount || 0)}`}
              </button>

              {/* LOADING BAR */}
              {fakePaying && (
                <div style={{ marginTop: 12, marginBottom: 4 }}>
                  <div style={S.loadingBar}>
                    <div style={S.loadingFill} />
                  </div>
                  <p style={{ textAlign: "center", fontSize: 12, color: "#888", marginTop: 6 }}>
                    Đang kết nối với ngân hàng...
                  </p>
                </div>
              )}

              <p style={{ textAlign: "center", fontSize: 11, color: "#aaa", margin: "12px 0" }}>
                🔒 Giao dịch được mã hóa 256-bit SSL • Hệ thống demo
              </p>

              <button style={S.btnCancelLink} onClick={() => navigate("/orders")}>
                Hủy giao dịch
              </button>
            </div>
          ) : (
            /* ✅ THÀNH CÔNG */
            <div style={S.successCard}>
              <div style={{ fontSize: 64, marginBottom: 12 }}>✅</div>
              <h2 style={S.successTitle}>Giao dịch thành công!</h2>
              <div style={S.txnBox}>
                {[
                  ["Mã đơn hàng", `#${orderDone.order.orderId}`],
                  ["Mã giao dịch", fakeTxnId],
                  ["Số tiền", formatVND(orderDone.payment?.paidAmount || 0)],
                  ["Tài khoản nguồn", fakeForm.accountNumber],
                  ["Chủ tài khoản", fakeForm.accountName],
                  ["Trạng thái", "✅ Thành công"],
                ].map(([label, value]) => (
                  <div key={label} style={S.txnRow}>
                    <span style={{ color: "#666", fontSize: 13 }}>{label}</span>
                    <strong style={{
                      fontSize: 13,
                      color: label === "Số tiền" ? "#16a34a"
                        : label === "Mã giao dịch" ? "#1d4ed8"
                        : "#111"
                    }}>{value}</strong>
                  </div>
                ))}
              </div>
              <button style={S.btnRed} onClick={() => navigate("/orders")}>
                Xem đơn hàng của tôi
              </button>
            </div>
          )}
        </div>
        <style>{`
          @keyframes fillBar {
            0% { width: 0% }
            40% { width: 50% }
            80% { width: 85% }
            100% { width: 95% }
          }
        `}</style>
      </div>
    );
  }

  // ===== TRANG CHECKOUT CHÍNH =====
  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <div style={S.navLogo} onClick={() => navigate("/")}>👓 GlassesShop</div>
        <button style={S.navBack} onClick={() => navigate("/cart")}>← Quay lại giỏ hàng</button>
      </nav>

      <div style={S.container}>
        <h2 style={S.title}>Thanh toán</h2>
        {loading ? <div style={S.loading}>Đang tải...</div> : (
          <div style={S.layout}>
            <div>
              <div style={S.section}>
                <h3 style={S.sectionTitle}>📍 Địa chỉ giao hàng</h3>
                <input style={S.input}
                  placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố..."
                  value={form.shippingAddress}
                  onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })} />
              </div>

              <div style={S.section}>
                <h3 style={S.sectionTitle}>💳 Phương thức thanh toán</h3>
                {[
                  { value: "COD", icon: "💵", label: "Thanh toán khi nhận hàng", sub: "COD - Nhận hàng mới trả tiền" },
                  { value: "BANKING", icon: "🏦", label: "Chuyển khoản ngân hàng", sub: "Internet Banking giả lập" },
                ].map((m) => (
                  <div key={m.value}
                    style={{ ...S.payMethod, ...(form.paymentMethod === m.value ? S.payActive : {}) }}
                    onClick={() => setForm({ ...form, paymentMethod: m.value })}>
                    <span style={{ fontSize: 26 }}>{m.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{m.label}</p>
                      <p style={{ fontSize: 12, color: "#888" }}>{m.sub}</p>
                    </div>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                      border: `2px solid ${form.paymentMethod === m.value ? "#ee4d2d" : "#ddd"}`,
                      background: form.paymentMethod === m.value ? "#ee4d2d" : "white",
                    }} />
                  </div>
                ))}
              </div>

              <div style={S.section}>
                <h3 style={S.sectionTitle}>🎟️ Mã giảm giá</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  <input style={{ ...S.input, flex: 1 }}
                    placeholder="Nhập mã giảm giá..."
                    value={form.discountCode}
                    onChange={(e) => setForm({ ...form, discountCode: e.target.value })} />
                  <button style={S.btnApply}>Áp dụng</button>
                </div>
              </div>
            </div>

            <div style={S.summary}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                Đơn hàng ({items.length} sản phẩm)
              </h3>
              {items.map((item) => (
                <div key={item.cartItemId} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 10 }}>
                  <span style={{ flex: 1, marginRight: 8 }}>
                    {item.productType === "CONTACT_LENS" ? "🔵" : "👓"} {item.productName || "Sản phẩm"}
                    <span style={{ color: "#888" }}> x{item.quantity}</span>
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    {formatVND((item.price || 0) * (item.quantity || 1))}
                  </span>
                </div>
              ))}
              <div style={{ height: 1, background: "#f0f0f0", margin: "12px 0" }} />
              {[
                ["Tạm tính", formatVND(subtotal), false],
                ["Phí vận chuyển", "Miễn phí", true],
              ].map(([label, value, green]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 10 }}>
                  <span style={{ color: "#666" }}>{label}</span>
                  <span style={{ fontWeight: 600, color: green ? "#16a34a" : "#111" }}>{value}</span>
                </div>
              ))}
              <div style={{ height: 1, background: "#f0f0f0", margin: "12px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 18 }}>
                <span>Tổng cộng</span>
                <span style={{ color: "#ee4d2d" }}>{formatVND(subtotal)}</span>
              </div>
              <button style={{ ...S.btnOrder, opacity: submitting ? 0.7 : 1 }}
                onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Đang xử lý..." : "Đặt hàng ngay →"}
              </button>
              <p style={{ textAlign: "center", fontSize: 12, color: "#aaa", marginTop: 10 }}>
                🔒 Thông tin được bảo mật
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fillBar {
          0% { width: 0% }
          40% { width: 50% }
          80% { width: 85% }
          100% { width: 95% }
        }
      `}</style>
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
  navBack: { background: "transparent", border: "none", color: "white", fontSize: 14, cursor: "pointer" },

  container: { maxWidth: 1100, margin: "0 auto", padding: "24px 16px" },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 24 },
  loading: { textAlign: "center", padding: 60, color: "#888" },
  layout: { display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" },

  section: { background: "white", borderRadius: 6, padding: 20, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
  sectionTitle: { fontSize: 16, fontWeight: 700, marginBottom: 16 },
  input: { width: "100%", padding: "12px 14px", border: "1px solid #ddd", borderRadius: 4, fontSize: 14, outline: "none", boxSizing: "border-box" },

  payMethod: {
    display: "flex", alignItems: "center", gap: 12, padding: 14,
    border: "2px solid #eee", borderRadius: 6, cursor: "pointer",
    marginBottom: 10, transition: "all 0.2s",
  },
  payActive: { border: "2px solid #ee4d2d", background: "#fff8f7" },

  btnApply: { padding: "12px 20px", background: "#ee4d2d", color: "white", border: "none", borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: "pointer" },

  summary: { background: "white", borderRadius: 6, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", position: "sticky", top: 70 },
  btnOrder: { width: "100%", padding: "14px", background: "#ee4d2d", color: "white", border: "none", borderRadius: 4, fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 16 },

  // Banking
  centerWrap: { display: "flex", justifyContent: "center", padding: "32px 16px" },
  bankCard: { background: "white", borderRadius: 8, padding: "28px 32px", maxWidth: 480, width: "100%", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" },
  bankHeader: { display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, borderBottom: "2px solid #e2e8f0", marginBottom: 20 },
  bankName: { fontWeight: 800, fontSize: 16, color: "#1e40af", margin: 0 },
  bankSub: { fontSize: 11, color: "#888", margin: 0 },
  demoBadge: { marginLeft: "auto", background: "#fef3c7", color: "#92400e", padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 },

  infoBox: { background: "#eff6ff", borderRadius: 6, padding: 16, marginBottom: 20 },
  boxTitle: { fontSize: 13, fontWeight: 700, color: "#1e40af", marginBottom: 12 },
  infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid #dbeafe" },
  infoLabel: { fontSize: 12, color: "#6b7280" },
  infoValue: { fontWeight: 600 },

  fieldLabel: { display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 },
  fieldInput: { width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4, fontSize: 14, outline: "none", boxSizing: "border-box" },

  btnTransfer: { width: "100%", padding: "14px", background: "#1d4ed8", color: "white", border: "none", borderRadius: 6, fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 12 },

  loadingBar: { height: 6, background: "#e5e7eb", borderRadius: 999, overflow: "hidden" },
  loadingFill: { height: "100%", background: "#1d4ed8", borderRadius: 999, animation: "fillBar 2.5s ease-out forwards" },

  btnCancelLink: { width: "100%", padding: "10px", background: "transparent", color: "#888", border: "1px solid #ddd", borderRadius: 4, fontSize: 14, cursor: "pointer" },

  // Success
  successCard: { background: "white", borderRadius: 8, padding: "36px 32px", maxWidth: 460, width: "100%", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", textAlign: "center" },
  successTitle: { fontSize: 22, fontWeight: 700, marginBottom: 8 },
  txnBox: { background: "#f8fafc", borderRadius: 6, padding: 16, marginBottom: 24, textAlign: "left" },
  txnRow: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb" },
  codBox: { background: "#f0fdf4", borderRadius: 6, padding: 20, marginBottom: 24, border: "1px solid #bbf7d0" },
  btnRed: { padding: "12px 32px", background: "#ee4d2d", color: "white", border: "none", borderRadius: 4, fontSize: 15, fontWeight: 600, cursor: "pointer" },
};