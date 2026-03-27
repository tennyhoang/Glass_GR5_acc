import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../../services/authService";
import api from "../../services/api";
import ImageUpload from "./ImageUpload";
import { useToast } from "../../components/Toast";

const MENU = [
  { key: "overview",  icon: "📊", label: "Tong Quan" },
  { key: "orders",    icon: "📦", label: "Don Hang" },
  { key: "accounts",  icon: "👥", label: "Tai Khoan" },
  { key: "products",  icon: "🛍️", label: "San Pham" },
  { key: "discounts", icon: "🎟️", label: "Ma Giam Gia" },
];

const STATUS_COLORS = {
  PENDING:       { bg: "#fef3c7", color: "#d97706", label: "Cho XN" },
  CONFIRMED:     { bg: "#dbeafe", color: "#2563eb", label: "Da XN" },
  MANUFACTURING: { bg: "#ede9fe", color: "#7c3aed", label: "San xuat" },
  SHIPPING:      { bg: "#cffafe", color: "#0891b2", label: "Dang giao" },
  DELIVERED:     { bg: "#dcfce7", color: "#16a34a", label: "Da giao" },
  CANCELLED:     { bg: "#fee2e2", color: "#dc2626", label: "Da huy" },
};

const ROLES = ["USER", "STAFF", "OPERATION", "SHIPPER", "ADMIN"];

const PRODUCT_CONFIGS = {
  readyMade: {
    label: "Kinh Co San", endpoint: "/admin/rmglasses",
    idKey: "readyGlassesId",
    fields: [
      { key: "name",      label: "Ten san pham *", type: "text" },
      { key: "frameId",   label: "Frame ID *",     type: "number" },
      { key: "lensId",    label: "Lens ID *",      type: "number" },
      { key: "fixedSph",  label: "Do cau (SPH)",   type: "select", options: ["-20","-10","-8","-6","-5","-4","-3","-2.5","-2","-1.5","-1","-0.5","0","0.5","1","1.5","2","2.5","3","4","5","6","8","10","20"] },
      { key: "fixedCyl",  label: "Do tru (CYL)",   type: "select", options: ["0","-0.25","-0.5","-0.75","-1","-1.25","-1.5","-1.75","-2","-2.5","-3","-4"] },
      { key: "price",     label: "Gia (VND) *",    type: "number" },
      { key: "stock",     label: "Ton kho",         type: "number" },
      { key: "status",    label: "Trang thai",      type: "select", options: ["ACTIVE","INACTIVE"] },
      { key: "imageUrl",  label: "Anh san pham",    type: "image" },
    ],
  },
  frames: {
    label: "Gong Kinh", endpoint: "/admin/frames",
    idKey: "frameId",
    fields: [
      { key: "name",      label: "Ten gong *",     type: "text" },
      { key: "brand",     label: "Thuong hieu *",  type: "select", options: ["Ray-Ban","Oakley","Gucci","Prada","Versace","Dior","Tom Ford","Carrera","Persol","Maui Jim","Nike","Adidas","Hugo Boss","Calvin Klein","GlassesShop Original"] },
      { key: "material",  label: "Chat lieu",       type: "select", options: ["Titanium","Acetate","Stainless Steel","Aluminum","TR90","Nylon","Carbon Fiber","Wood","Gold Plated"] },
      { key: "size",      label: "Kich co",         type: "select", options: ["XS","S","M","L","XL"] },
      { key: "color",     label: "Mau sac",         type: "select", options: ["Black","White","Silver","Gold","Brown","Blue","Red","Green","Pink","Purple","Tortoise","Clear","Gray"] },
      { key: "rimType",   label: "Kieu gong",       type: "select", options: ["FULL","HALF","RIMLESS"] },
      { key: "frameType", label: "Loai kinh",       type: "select", options: ["EYEGLASSES","SUNGLASSES"] },
      { key: "price",     label: "Gia (VND) *",     type: "number" },
      { key: "stock",     label: "Ton kho",          type: "number" },
      { key: "status",    label: "Trang thai",       type: "select", options: ["ACTIVE","INACTIVE"] },
      { key: "imageUrl",  label: "Anh gong kinh",   type: "image" },
    ],
  },
  lenses: {
    label: "Trong Kinh", endpoint: "/admin/lens",
    idKey: "lensId",
    fields: [
      { key: "name",        label: "Ten trong *",            type: "text" },
      { key: "lensType",    label: "Loai trong",             type: "select", options: ["Single Vision","Progressive","Bifocal","Blue Light Blocking","Photochromic","Polarized","Anti-Reflective"] },
      { key: "minSph",      label: "SPH min",                type: "select", options: ["-20","-16","-12","-10","-8","-6","-4","-2","0"] },
      { key: "maxSph",      label: "SPH max",                type: "select", options: ["0","1","2","3","4","5","6","8","10","12","16","20"] },
      { key: "minCyl",      label: "CYL min",                type: "select", options: ["-6","-4","-3","-2","-1","0"] },
      { key: "maxCyl",      label: "CYL max",                type: "select", options: ["0","1","2","3","4","6"] },
      { key: "basePrice",   label: "Gia goc (VND) *",        type: "number" },
      { key: "stock",       label: "Ton kho",                 type: "number" },
      { key: "colorChange", label: "Doi mau (Photochromic)", type: "select", options: ["false","true"] },
      { key: "status",      label: "Trang thai",              type: "select", options: ["ACTIVE","INACTIVE"] },
      { key: "imageUrl",    label: "Anh trong kinh",          type: "image" },
    ],
  },
  contacts: {
    label: "Kinh Ap Trong", endpoint: "/admin/contactlens",
    idKey: "contactLensId",
    fields: [
      { key: "name",        label: "Ten kinh *",      type: "text" },
      { key: "brand",       label: "Thuong hieu *",   type: "select", options: ["Acuvue","Air Optix","Biofinity","Bausch & Lomb","CooperVision","Alcon","FreshLook","Soflens","PureVision","Dailies"] },
      { key: "contactType", label: "Loai kinh",       type: "select", options: ["Daily","Weekly","Monthly","Bi-weekly","Annual"] },
      { key: "color",       label: "Mau sac",          type: "select", options: ["Clear","Brown","Blue","Green","Gray","Hazel","Violet","Turquoise"] },
      { key: "minSph",      label: "SPH min",          type: "select", options: ["-20","-16","-12","-10","-8","-6","-4","-2","0"] },
      { key: "maxSph",      label: "SPH max",          type: "select", options: ["0","1","2","3","4","5","6","8","10","12","16","20"] },
      { key: "minCyl",      label: "CYL min",          type: "select", options: ["-6","-4","-3","-2","-1","0"] },
      { key: "maxCyl",      label: "CYL max",          type: "select", options: ["0","1","2","3","4","6"] },
      { key: "price",       label: "Gia (VND) *",      type: "number" },
      { key: "stock",       label: "Ton kho",           type: "number" },
      { key: "status",      label: "Trang thai",        type: "select", options: ["ACTIVE","INACTIVE"] },
      { key: "imageUrl",    label: "Anh kinh ap trong", type: "image" },
    ],
  },
  lensOptions: {
    label: "Tuy Chon Trong", endpoint: "/admin/lensoption",
    idKey: "lensOptionId",
    fields: [
      { key: "optionName", label: "Ten tuy chon *",  type: "select", options: ["Anti-glare Coating","UV Protection","Blue Light Blocking","Scratch Resistant","Water Repellent","Photochromic","Polarized","Mirror Coating"] },
      { key: "indexValue", label: "Chiet suat",      type: "select", options: ["1.50","1.53","1.56","1.60","1.67","1.74"] },
      { key: "coating",    label: "Lop phu",          type: "select", options: ["Standard","Premium","Super Premium","Diamond"] },
      { key: "extraPrice", label: "Gia them (VND) *", type: "number" },
    ],
  },
};

export default function AdminDashboard() {
  const navigate  = useNavigate();
  const user      = getUser();
  const toast     = useToast();
  const [tab, setTab]             = useState("overview");
  const [stats, setStats]         = useState(null);
  const [orders, setOrders]       = useState([]);
  const [accounts, setAccounts]   = useState([]);
  const [products, setProducts]   = useState({ readyMade:[], frames:[], lenses:[], contacts:[], lensOptions:[] });
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [productTab, setProductTab] = useState("readyMade");

  const [showProductForm, setShowProductForm] = useState(false);
  const [productFormType, setProductFormType] = useState("readyMade");
  const [productForm, setProductForm]         = useState({});
  const [editingProduct, setEditingProduct]   = useState(null);

  const [showDiscountForm, setShowDiscountForm] = useState(false);
  // ✅ Thêm discountType và minQuantity vào state
  const [discountForm, setDiscountForm] = useState({
    code: "", discountType: "COUPON", discountValue: "",
    minQuantity: "1", minOrderAmount: "",
    startDate: "", endDate: "", status: "ACTIVE",
  });

  useEffect(() => {
    if (!user || user.role !== "ADMIN") { navigate("/"); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dash, ord, acc, rm, fr, ln, cl, disc, lo] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/staff/orders"),
        api.get("/admin/accounts"),
        api.get("/admin/rmglasses/all"),
        api.get("/admin/frames/allframes"),
        api.get("/admin/lens/all"),
        api.get("/admin/contactlens/all"),
        api.get("/admin/discount/all"),
        api.get("/admin/lensoption/all"),
      ]);
      setStats(dash.data);
      setOrders(Array.isArray(ord.data) ? ord.data : []);
      setAccounts(Array.isArray(acc.data) ? acc.data : []);
      setProducts({
        readyMade:   Array.isArray(rm.data)   ? rm.data   : [],
        frames:      Array.isArray(fr.data)   ? fr.data   : [],
        lenses:      Array.isArray(ln.data)   ? ln.data   : [],
        contacts:    Array.isArray(cl.data)   ? cl.data   : [],
        lensOptions: Array.isArray(lo.data)   ? lo.data   : [],
      });
      setDiscounts(Array.isArray(disc.data) ? disc.data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fmt     = n => new Intl.NumberFormat("vi-VN", { style:"currency", currency:"VND" }).format(n || 0);
  const fmtDate = d => d ? new Date(d).toLocaleDateString("vi-VN") : "-";

  // ── ACCOUNTS ──
  const handleChangeRole = async (accountId, newRole) => {
    try {
      await api.put("/admin/accounts/" + accountId + "/role", { role: newRole });
      setAccounts(prev => prev.map(a => a.accountId === accountId ? { ...a, role: newRole } : a));
      toast({ message: "Da cap nhat role!", type: "success" });
    } catch (e) { alert("Loi: " + (e.response?.data?.message || e.message)); }
  };

  const handleToggleStatus = async (customerId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    if (!window.confirm("Chuyen trang thai thanh " + newStatus + "?")) return;
    try {
      await api.put("/admin/customers/" + customerId + "/status", { status: newStatus });
      setAccounts(prev => prev.map(a =>
        a.customerId === customerId ? { ...a, status: newStatus } : a));
      toast({ message: newStatus === "BLOCKED" ? "Da khoa tai khoan!" : "Da mo khoa tai khoan!", type: "success" });
    } catch (e) { alert("Loi: " + (e.response?.data?.message || e.message)); }
  };

  // ── PRODUCTS ──
  const buildDefaultForm = (type) => {
    const defaults = {};
    PRODUCT_CONFIGS[type].fields.forEach(f => {
      defaults[f.key] = f.type === "select" ? f.options[0] : "";
    });
    return defaults;
  };

  const openCreateProduct = (type) => {
    setProductFormType(type);
    setEditingProduct(null);
    setProductForm(buildDefaultForm(type));
    setShowProductForm(true);
  };

  const openEditProduct = (type, item) => {
    setProductFormType(type);
    setEditingProduct(item);
    const form = {};
    PRODUCT_CONFIGS[type].fields.forEach(f => { form[f.key] = item[f.key] ?? ""; });
    setProductForm(form);
    setShowProductForm(true);
  };

  const handleSaveProduct = async () => {
    const cfg = PRODUCT_CONFIGS[productFormType];
    try {
      const payload = {};
      cfg.fields.forEach(f => {
        const val = productForm[f.key];
        if (f.type === "image") { payload[f.key] = val || null; return; }
        if (val === "" || val === null || val === undefined) {
          payload[f.key] = null;
        } else if (f.type === "number") {
          payload[f.key] = f.step ? parseFloat(val) : parseInt(val);
        } else if (f.key === "colorChange") {
          payload[f.key] = val === "true" || val === true;
        } else {
          payload[f.key] = val;
        }
      });
      if (editingProduct) {
        await api.put(cfg.endpoint + "/update/" + editingProduct[cfg.idKey], payload);
        toast({ message: "Cap nhat san pham thanh cong!", type: "success" });
      } else {
        await api.post(cfg.endpoint + "/create", payload);
        toast({ message: "Tao san pham moi thanh cong!", type: "success" });
      }
      setShowProductForm(false);
      fetchAll();
    } catch (e) { alert("Loi: " + (e.response?.data?.message || e.message)); }
  };

  const handleDeleteProduct = async (type, id) => {
    if (!window.confirm("Xoa san pham nay?")) return;
    try {
      await api.delete(PRODUCT_CONFIGS[type].endpoint + "/delete/" + id);
      fetchAll();
    } catch (e) { alert("Loi: " + (e.response?.data?.message || e.message)); }
  };

  const handleToggleProductStatus = async (type, id, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await api.put(PRODUCT_CONFIGS[type].endpoint + "/update/" + id, { status: newStatus });
      setProducts(prev => ({
        ...prev,
        [type]: prev[type].map(item =>
          item[PRODUCT_CONFIGS[type].idKey] === id ? { ...item, status: newStatus } : item),
      }));
      toast({ message: newStatus === "ACTIVE" ? "Da bat san pham!" : "Da tat san pham!", type: "success" });
    } catch (e) { alert("Loi: " + (e.response?.data?.message || e.message)); }
  };

  // ── DISCOUNTS ──
  const handleSaveDiscount = async () => {
    if (!discountForm.code.trim())   { alert("Vui long nhap ma giam gia!"); return; }
    if (!discountForm.discountValue) { alert("Vui long nhap % giam gia!"); return; }
    if (!discountForm.startDate)     { alert("Vui long chon ngay bat dau!"); return; }
    if (!discountForm.endDate)       { alert("Vui long chon ngay ket thuc!"); return; }
    try {
      // ✅ Gửi đầy đủ tất cả field BE yêu cầu
      await api.post("/admin/discount/create", {
        code:           discountForm.code.trim().toUpperCase(),
        discountType:   discountForm.discountType || "COUPON",
        discountValue:  parseFloat(discountForm.discountValue),
        minQuantity:    parseInt(discountForm.minQuantity) || 1,
        minOrderAmount: discountForm.minOrderAmount ? parseFloat(discountForm.minOrderAmount) : 0,
        startDate:      discountForm.startDate,
        endDate:        discountForm.endDate,
        status:         discountForm.status || "ACTIVE",
      });
      toast({ message: "Tao ma giam gia thanh cong!", type: "success" });
      setShowDiscountForm(false);
      // ✅ Reset form về mặc định
      setDiscountForm({
        code: "", discountType: "COUPON", discountValue: "",
        minQuantity: "1", minOrderAmount: "",
        startDate: "", endDate: "", status: "ACTIVE",
      });
      fetchAll();
    } catch (e) { alert("Loi: " + (e.response?.data?.message || e.message)); }
  };

  const handleToggleDiscount = async (id, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await api.put("/admin/discount/update/" + id, { status: newStatus });
      fetchAll();
    } catch (e) { alert("Loi: " + (e.response?.data?.message || e.message)); }
  };

  const currentProductList = products[productTab] || [];
  const currentCfg = PRODUCT_CONFIGS[productTab];

  return (
    <div style={S.shell}>
      {/* SIDEBAR */}
      <aside style={S.sidebar}>
        <div style={S.brand}>
          <span style={{ fontSize:28 }}>👓</span>
          <div>
            <div style={S.brandName}>GlassesShop</div>
            <div style={S.brandSub}>Admin Panel</div>
          </div>
        </div>
        <nav style={{ flex:1 }}>
          {MENU.map(m => (
            <button key={m.key} onClick={() => setTab(m.key)}
              style={{ ...S.menuBtn, ...(tab === m.key ? S.menuBtnActive : {}) }}>
              <span style={{ fontSize:18 }}>{m.icon}</span>
              <span>{m.label}</span>
              {tab === m.key && <div style={S.menuActiveLine} />}
            </button>
          ))}
        </nav>
        <div style={S.sideFooter}>
          <div style={S.adminInfo}>
            <div style={S.adminAvatar}>{(user?.name || "A")[0].toUpperCase()}</div>
            <div>
              <div style={{ color:"white", fontSize:13, fontWeight:600 }}>{user?.name || user?.username}</div>
              <div style={{ color:"rgba(255,255,255,0.5)", fontSize:11 }}>Administrator</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            <button style={S.sideBtn} onClick={() => navigate("/")}>Trang chu</button>
            <button style={{ ...S.sideBtn, background:"rgba(239,68,68,0.2)", color:"#fca5a5" }}
              onClick={() => { logout(); navigate("/"); }}>Thoat</button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={S.main}>
        {loading ? <Spinner /> : (
          <>
            {/* ── OVERVIEW ── */}
            {tab === "overview" && (
              <div>
                <PageTitle title="Tong Quan He Thong" sub="Theo doi toan bo hoat dong cua cua hang" />
                <div style={S.statsGrid}>
                  {[
                    { icon:"📦", label:"Tong don hang", value: stats?.totalOrders ?? orders.length, color:"#3b82f6" },
                    { icon:"⏳", label:"Cho xu ly", value: orders.filter(o => o.status === "PENDING").length, color:"#f59e0b" },
                    { icon:"💰", label:"Doanh thu", value: fmt(stats?.totalRevenue ?? orders.filter(o => o.paymentStatus === "PAID").reduce((s,o) => s+(o.finalAmount||0),0)), color:"#16a34a", big:true },
                    { icon:"👥", label:"Tai khoan", value: accounts.length, color:"#8b5cf6" },
                    { icon:"🛍️", label:"San pham", value: Object.values(products).reduce((s,a) => s+a.length, 0), color:"#ee4d2d" },
                    { icon:"🎟️", label:"Ma giam gia", value: discounts.filter(d => d.status === "ACTIVE").length + " dang hoat dong", color:"#0891b2", big:true },
                  ].map(s => (
                    <div key={s.label} style={S.statCard}>
                      <div style={{ ...S.statIcon, background:s.color+"18", color:s.color }}>{s.icon}</div>
                      <div>
                        <div style={{ fontSize:s.big?16:26, fontWeight:800, color:"#111", marginBottom:2 }}>{s.value}</div>
                        <div style={{ fontSize:12, color:"#888" }}>{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <SectionCard title="Don hang gan day">
                  <OrderTable orders={orders.slice(0,8)} fmt={fmt} fmtDate={fmtDate} />
                </SectionCard>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:16 }}>
                  <SectionCard title="Trang thai don hang">
                    {Object.entries(STATUS_COLORS).map(([key, sc]) => {
                      const count = orders.filter(o => o.status === key).length;
                      const pct   = orders.length ? Math.round(count / orders.length * 100) : 0;
                      return (
                        <div key={key} style={{ marginBottom:10 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}>
                            <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                              <span style={{ ...S.dot, background:sc.color }} />{sc.label}
                            </span>
                            <span style={{ fontWeight:600 }}>{count}</span>
                          </div>
                          <div style={{ height:6, background:"#f0f0f0", borderRadius:999 }}>
                            <div style={{ width:pct+"%", height:"100%", background:sc.color, borderRadius:999, transition:"width 0.5s" }} />
                          </div>
                        </div>
                      );
                    })}
                  </SectionCard>
                  <SectionCard title="San pham theo danh muc">
                    {[
                      { label:"Kinh co san",   count:products.readyMade.length, icon:"👓" },
                      { label:"Gong kinh",     count:products.frames.length,    icon:"🕶️" },
                      { label:"Trong kinh",    count:products.lenses.length,    icon:"🔍" },
                      { label:"Kinh ap trong", count:products.contacts.length,  icon:"🔵" },
                    ].map(p => (
                      <div key={p.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #f5f5f5" }}>
                        <span style={{ fontSize:13 }}>{p.icon} {p.label}</span>
                        <span style={{ background:"#f0f0f0", padding:"2px 10px", borderRadius:999, fontWeight:700, fontSize:13 }}>{p.count}</span>
                      </div>
                    ))}
                  </SectionCard>
                </div>
              </div>
            )}

            {/* ── ORDERS ── */}
            {tab === "orders" && (
              <div>
                <PageTitle title="Quan Ly Don Hang" sub={orders.length + " don hang trong he thong"} />
                <SectionCard>
                  <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
                    {["ALL", ...Object.keys(STATUS_COLORS)].map(f => {
                      const sc    = STATUS_COLORS[f];
                      const count = f === "ALL" ? orders.length : orders.filter(o => o.status === f).length;
                      return (
                        <span key={f} style={{ padding:"4px 12px", borderRadius:999, fontSize:12, fontWeight:600, background:sc?.bg||"#f0f0f0", color:sc?.color||"#555" }}>
                          {sc?.label||"Tat ca"} ({count})
                        </span>
                      );
                    })}
                  </div>
                  <OrderTable orders={orders} fmt={fmt} fmtDate={fmtDate} full />
                </SectionCard>
              </div>
            )}

            {/* ── ACCOUNTS ── */}
            {tab === "accounts" && (
              <div>
                <PageTitle title="Quan Ly Tai Khoan" sub={accounts.length + " tai khoan"} />
                <SectionCard>
                  <div style={{ overflowX:"auto" }}>
                    <table style={S.table}>
                      <thead>
                        <tr style={S.thead}>
                          {["ID","Username","Ho ten","Email","Role","Trang thai","Hanh dong"].map(h => (
                            <th key={h} style={S.th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {accounts.map(a => (
                          <tr key={a.accountId} style={S.tr}>
                            <td style={S.td}>
                              <span style={{ background:"#f0f0f0", padding:"2px 8px", borderRadius:4, fontSize:12, fontWeight:700 }}>#{a.accountId}</span>
                            </td>
                            <td style={{ ...S.td, fontWeight:700 }}>{a.username}</td>
                            <td style={S.td}>{a.name || <span style={{ color:"#ccc" }}>-</span>}</td>
                            <td style={{ ...S.td, fontSize:12, color:"#666" }}>{a.email || <span style={{ color:"#ccc" }}>-</span>}</td>
                            <td style={S.td}>
                              <select value={a.role}
                                onChange={e => handleChangeRole(a.accountId, e.target.value)}
                                style={{ padding:"5px 8px", border:"1px solid #e5e7eb", borderRadius:4, fontSize:12, cursor:"pointer", background:"white" }}>
                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                            </td>
                            <td style={S.td}>
                              <span style={{ padding:"3px 10px", borderRadius:999, fontSize:11, fontWeight:600,
                                background: a.status === "ACTIVE" ? "#dcfce7" : "#fee2e2",
                                color:      a.status === "ACTIVE" ? "#16a34a" : "#dc2626" }}>
                                {a.status === "ACTIVE" ? "Hoat dong" : "Da khoa"}
                              </span>
                            </td>
                            <td style={S.td}>
                              {a.customerId ? (
                                <button onClick={() => handleToggleStatus(a.customerId, a.status)}
                                  style={{ padding:"5px 14px", fontSize:12, borderRadius:4, border:"none", cursor:"pointer", fontWeight:600,
                                    background: a.status === "ACTIVE" ? "#fee2e2" : "#dcfce7",
                                    color:      a.status === "ACTIVE" ? "#dc2626" : "#16a34a" }}>
                                  {a.status === "ACTIVE" ? "🔒 Khoa" : "🔓 Mo khoa"}
                                </button>
                              ) : (
                                <span style={{ fontSize:11, color:"#aaa" }}>System account</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>
              </div>
            )}

            {/* ── PRODUCTS ── */}
            {tab === "products" && (
              <div>
                <PageTitle title="Quan Ly San Pham" sub="Them, sua, xoa cac loai san pham" />
                <div style={{ display:"flex", gap:0, marginBottom:0, background:"white", borderRadius:"8px 8px 0 0", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}>
                  {Object.entries(PRODUCT_CONFIGS).map(([key, cfg]) => (
                    <button key={key} onClick={() => setProductTab(key)}
                      style={{ flex:1, padding:"13px 12px", border:"none",
                        background:   productTab === key ? "#ee4d2d" : "white",
                        color:        productTab === key ? "white"   : "#555",
                        fontWeight:   productTab === key ? 700       : 500,
                        fontSize:13, cursor:"pointer",
                        borderBottom: productTab === key ? "2px solid #ee4d2d" : "2px solid transparent",
                        transition:"all 0.15s" }}>
                      {cfg.label}
                      <span style={{ marginLeft:6, fontSize:11, padding:"1px 6px", borderRadius:999,
                        background: productTab === key ? "rgba(255,255,255,0.25)" : "#f0f0f0",
                        color:      productTab === key ? "white" : "#888" }}>
                        {products[key]?.length || 0}
                      </span>
                    </button>
                  ))}
                </div>
                <div style={{ background:"white", borderRadius:"0 0 8px 8px", padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}>
                  <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:16 }}>
                    <button style={S.btnCreate} onClick={() => openCreateProduct(productTab)}>
                      + Tao {currentCfg.label} moi
                    </button>
                  </div>
                  <div style={{ overflowX:"auto" }}>
                    <table style={S.table}>
                      <thead>
                        <tr style={S.thead}>
                          <th style={S.th}>ID</th>
                          <th style={S.th}>Ten san pham</th>
                          {productTab === "frames"     && <><th style={S.th}>Thuong hieu</th><th style={S.th}>Chat lieu</th><th style={S.th}>Kich co</th></>}
                          {productTab === "lenses"     && <><th style={S.th}>Loai trong</th><th style={S.th}>SPH</th></>}
                          {productTab === "contacts"   && <><th style={S.th}>Thuong hieu</th><th style={S.th}>Loai</th><th style={S.th}>Mau</th></>}
                          {productTab === "readyMade"  && <><th style={S.th}>Do cau</th><th style={S.th}>Do tru</th></>}
                          {productTab === "lensOptions"&& <><th style={S.th}>Chiet suat</th><th style={S.th}>Lop phu</th></>}
                          {productTab !== "lensOptions" && <th style={S.th}>Gia</th>}
                          {productTab === "lensOptions" && <th style={S.th}>Gia them</th>}
                          {productTab !== "lensOptions" && <th style={S.th}>Ton kho</th>}
                          {productTab !== "lensOptions" && <th style={S.th}>Trang thai</th>}
                          <th style={S.th}>Hanh dong</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentProductList.map(item => {
                          const id    = item[currentCfg.idKey];
                          const price = item.price || item.basePrice || 0;
                          return (
                            <tr key={id} style={S.tr}>
                              <td style={S.td}><span style={{ background:"#f0f0f0", padding:"2px 8px", borderRadius:4, fontSize:12, fontWeight:700 }}>#{id}</span></td>
                              <td style={{ ...S.td, fontWeight:600, maxWidth:200 }}>{item.name || item.optionName}</td>
                              {productTab === "frames"    && <><td style={S.td}>{item.brand}</td><td style={S.td}>{item.material}</td><td style={S.td}>{item.size}</td></>}
                              {productTab === "lenses"    && <><td style={S.td}>{item.lensType}</td><td style={S.td}>{item.minSph}~{item.maxSph}</td></>}
                              {productTab === "contacts"  && <><td style={S.td}>{item.brand}</td><td style={S.td}>{item.contactType}</td><td style={S.td}>{item.color}</td></>}
                              {productTab === "readyMade" && <><td style={S.td}>{item.fixedSph}</td><td style={S.td}>{item.fixedCyl}</td></>}
                              {productTab === "lensOptions"&&<><td style={S.td}>{item.indexValue}</td><td style={S.td}>{item.coating}</td></>}
                              {productTab !== "lensOptions" && <td style={{ ...S.td, fontWeight:700, color:"#ee4d2d" }}>{fmt(price)}</td>}
                              {productTab === "lensOptions" && <td style={{ ...S.td, fontWeight:700, color:"#16a34a" }}>+ {fmt(item.extraPrice)}</td>}
                              {productTab !== "lensOptions" && <td style={S.td}>{item.stock ?? "-"}</td>}
                              {productTab !== "lensOptions" && (
                                <td style={S.td}>
                                  {item.stock === 0 ? (
                                    <span style={{ padding:"3px 8px", borderRadius:999, fontSize:11, fontWeight:600, background:"#fee2e2", color:"#dc2626" }}>Het hang</span>
                                  ) : (
                                    <span style={{ padding:"3px 8px", borderRadius:999, fontSize:11, fontWeight:600,
                                      background: item.status === "ACTIVE" ? "#dcfce7" : "#f3f4f6",
                                      color:      item.status === "ACTIVE" ? "#16a34a" : "#888" }}>
                                      {item.status === "ACTIVE" ? "Hoat dong" : "Da tat"}
                                    </span>
                                  )}
                                </td>
                              )}
                              <td style={S.td}>
                                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                                  <button onClick={() => openEditProduct(productTab, item)}
                                    style={{ padding:"5px 10px", background:"#dbeafe", color:"#2563eb", border:"none", borderRadius:4, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                                    Sua
                                  </button>
                                  {productTab !== "lensOptions" && item.stock > 0 && (
                                    <button onClick={() => handleToggleProductStatus(productTab, id, item.status)}
                                      style={{ padding:"5px 10px", border:"none", borderRadius:4, fontSize:12, fontWeight:600, cursor:"pointer",
                                        background: item.status === "ACTIVE" ? "#fef3c7" : "#dcfce7",
                                        color:      item.status === "ACTIVE" ? "#d97706" : "#16a34a" }}>
                                      {item.status === "ACTIVE" ? "Tat" : "Bat"}
                                    </button>
                                  )}
                                  <button onClick={() => handleDeleteProduct(productTab, id)}
                                    style={{ padding:"5px 10px", background:"#fee2e2", color:"#dc2626", border:"none", borderRadius:4, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                                    Xoa
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {currentProductList.length === 0 && (
                          <tr><td colSpan={10} style={{ textAlign:"center", padding:40, color:"#aaa" }}>Chua co san pham nao</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── DISCOUNTS ── */}
            {tab === "discounts" && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
                  <PageTitle title="Quan Ly Ma Giam Gia" sub={discounts.length + " ma giam gia"} noMargin />
                  <button style={S.btnCreate} onClick={() => setShowDiscountForm(true)}>+ Tao ma giam gia</button>
                </div>

                {showDiscountForm && (
                  <div style={{ background:"white", borderRadius:8, padding:24, marginBottom:20, boxShadow:"0 1px 4px rgba(0,0,0,0.08)", border:"2px solid #ee4d2d" }}>
                    <h3 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Tao Ma Giam Gia Moi</h3>
                    {/* ✅ 2 cột thay vì 3 cột */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                      {[
                        { key:"code",           label:"Ma giam gia *",        type:"text",          placeholder:"VD: SALE20" },
                        { key:"discountType",   label:"Loai giam gia *",       type:"select",        options:["COUPON","QUANTITY"] },
                        { key:"discountValue",  label:"% Giam gia *",          type:"number",        placeholder:"VD: 20" },
                        { key:"minQuantity",    label:"So luong toi thieu *",  type:"number",        placeholder:"VD: 1" },
                        { key:"minOrderAmount", label:"Don toi thieu (VND)",   type:"number",        placeholder:"VD: 500000" },
                        { key:"status",         label:"Trang thai",            type:"select",        options:["ACTIVE","INACTIVE"] },
                        { key:"startDate",      label:"Ngay bat dau *",        type:"datetime-local" },
                        { key:"endDate",        label:"Ngay ket thuc *",       type:"datetime-local" },
                      ].map(f => (
                        <div key={f.key}>
                          <label style={S.formLabel}>{f.label}</label>
                          {f.type === "select" ? (
                            <select value={discountForm[f.key]}
                              onChange={e => setDiscountForm({ ...discountForm, [f.key]: e.target.value })}
                              style={S.formInput}>
                              {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          ) : (
                            <input style={S.formInput} type={f.type}
                              placeholder={f.placeholder}
                              value={discountForm[f.key]}
                              onChange={e => setDiscountForm({ ...discountForm, [f.key]: e.target.value })} />
                          )}
                        </div>
                      ))}
                    </div>
                    <div style={{ display:"flex", gap:10, marginTop:20 }}>
                      <button style={S.btnSave} onClick={handleSaveDiscount}>Luu Ma Giam Gia</button>
                      <button style={S.btnCancelForm} onClick={() => setShowDiscountForm(false)}>Huy</button>
                    </div>
                  </div>
                )}

                <SectionCard>
                  <div style={{ overflowX:"auto" }}>
                    <table style={S.table}>
                      <thead>
                        <tr style={S.thead}>
                          {["ID","Ma code","Loai","% Giam","Don toi thieu","Bat dau","Ket thuc","Trang thai","Hanh dong"].map(h => (
                            <th key={h} style={S.th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {discounts.map(d => (
                          <tr key={d.discountId} style={S.tr}>
                            <td style={S.td}><span style={{ background:"#f0f0f0", padding:"2px 8px", borderRadius:4, fontSize:12, fontWeight:700 }}>#{d.discountId}</span></td>
                            <td style={{ ...S.td, fontWeight:800, fontSize:15, color:"#ee4d2d", letterSpacing:1 }}>{d.code}</td>
                            <td style={{ ...S.td, fontSize:12 }}>
                              <span style={{ padding:"2px 8px", borderRadius:999, fontSize:11, fontWeight:600,
                                background: d.discountType === "COUPON" ? "#dbeafe" : "#ede9fe",
                                color:      d.discountType === "COUPON" ? "#2563eb" : "#7c3aed" }}>
                                {d.discountType || "COUPON"}
                              </span>
                            </td>
                            <td style={{ ...S.td, fontWeight:700 }}>{d.discountValue}%</td>
                            <td style={S.td}>{d.minOrderAmount ? fmt(d.minOrderAmount) : "Khong gioi han"}</td>
                            <td style={S.td}>{fmtDate(d.startDate)}</td>
                            <td style={S.td}>{fmtDate(d.endDate)}</td>
                            <td style={S.td}>
                              <span style={{ padding:"3px 10px", borderRadius:999, fontSize:11, fontWeight:600,
                                background: d.status === "ACTIVE" ? "#dcfce7" : "#f3f4f6",
                                color:      d.status === "ACTIVE" ? "#16a34a" : "#888" }}>
                                {d.status === "ACTIVE" ? "Hoat dong" : "Tat"}
                              </span>
                            </td>
                            <td style={S.td}>
                              <button onClick={() => handleToggleDiscount(d.discountId, d.status)}
                                style={{ padding:"5px 12px", fontSize:12, borderRadius:4, border:"none", cursor:"pointer", fontWeight:600,
                                  background: d.status === "ACTIVE" ? "#fee2e2" : "#dcfce7",
                                  color:      d.status === "ACTIVE" ? "#dc2626" : "#16a34a" }}>
                                {d.status === "ACTIVE" ? "Tat" : "Bat"}
                              </button>
                            </td>
                          </tr>
                        ))}
                        {discounts.length === 0 && (
                          <tr><td colSpan={9} style={{ textAlign:"center", padding:40, color:"#aaa" }}>Chua co ma giam gia nao</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>
              </div>
            )}
          </>
        )}
      </main>

      {/* PRODUCT FORM MODAL */}
      {showProductForm && (
        <div style={S.modalOverlay} onClick={e => e.target === e.currentTarget && setShowProductForm(false)}>
          <div style={S.modalBox}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h3 style={{ fontSize:17, fontWeight:700 }}>
                {editingProduct ? "Chinh Sua" : "Tao Moi"} — {currentCfg.label}
              </h3>
              <button onClick={() => setShowProductForm(false)} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#999" }}>✕</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {PRODUCT_CONFIGS[productFormType].fields.map(f => (
                <div key={f.key} style={f.type === "image" ? { gridColumn:"1 / -1" } : {}}>
                  {f.type === "image" ? (
                    <ImageUpload
                      label={f.label}
                      value={productForm[f.key] || ""}
                      onChange={base64 => setProductForm({ ...productForm, [f.key]: base64 })}
                    />
                  ) : f.type === "select" ? (
                    <>
                      <label style={S.formLabel}>{f.label}</label>
                      <select value={productForm[f.key] ?? f.options[0]}
                        onChange={e => setProductForm({ ...productForm, [f.key]: e.target.value })}
                        style={S.formInput}>
                        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </>
                  ) : (
                    <>
                      <label style={S.formLabel}>{f.label}</label>
                      <input style={S.formInput} type={f.type} step={f.step}
                        value={productForm[f.key] ?? ""}
                        onChange={e => setProductForm({ ...productForm, [f.key]: e.target.value })} />
                    </>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:10, marginTop:24 }}>
              <button style={S.btnSave} onClick={handleSaveProduct}>
                {editingProduct ? "Cap nhat" : "Tao moi"}
              </button>
              <button style={S.btnCancelForm} onClick={() => setShowProductForm(false)}>Huy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PageTitle({ title, sub, noMargin }) {
  return (
    <div style={{ marginBottom: noMargin ? 0 : 20 }}>
      <h2 style={{ fontSize:22, fontWeight:800, color:"#111", marginBottom:4 }}>{title}</h2>
      {sub && <p style={{ fontSize:13, color:"#888" }}>{sub}</p>}
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div style={{ background:"white", borderRadius:8, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.07)", marginBottom:16 }}>
      {title && <div style={{ fontSize:15, fontWeight:700, marginBottom:16, color:"#111" }}>{title}</div>}
      {children}
    </div>
  );
}

function OrderTable({ orders, fmt, fmtDate, full }) {
  const cols = full
    ? ["Ma don","Khach hang","Tong tien","Phuong thuc","Thanh toan","Trang thai","Ngay dat"]
    : ["Ma don","Khach hang","Tong tien","Trang thai","Ngay dat"];
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead>
          <tr style={{ background:"#f8fafc" }}>
            {cols.map(h => <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:12, fontWeight:700, color:"#64748b", borderBottom:"1px solid #f0f0f0" }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {orders.map(o => {
            const sc = STATUS_COLORS[o.status] || { bg:"#f3f4f6", color:"#666", label:o.status };
            return (
              <tr key={o.orderId} style={{ borderBottom:"1px solid #f9fafb" }}>
                <td style={{ padding:"11px 14px", fontSize:13 }}>
                  <span style={{ background:"#f0f0f0", padding:"2px 8px", borderRadius:4, fontSize:12, fontWeight:700 }}>#{o.orderId}</span>
                </td>
                <td style={{ padding:"11px 14px", fontSize:13 }}>{o.customerName || o.customerId}</td>
                <td style={{ padding:"11px 14px", fontSize:13, fontWeight:700, color:"#ee4d2d" }}>{fmt(o.finalAmount)}</td>
                {full && <td style={{ padding:"11px 14px", fontSize:12 }}>{o.paymentMethod}</td>}
                {full && (
                  <td style={{ padding:"11px 14px" }}>
                    <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:999,
                      background: o.paymentStatus === "PAID" ? "#dcfce7" : "#fef3c7",
                      color:      o.paymentStatus === "PAID" ? "#16a34a" : "#d97706" }}>
                      {o.paymentStatus === "PAID" ? "Da TT" : o.paymentStatus || "Chua TT"}
                    </span>
                  </td>
                )}
                <td style={{ padding:"11px 14px" }}>
                  <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:999, background:sc.bg, color:sc.color }}>{sc.label}</span>
                </td>
                <td style={{ padding:"11px 14px", fontSize:12, color:"#888" }}>{fmtDate(o.orderDate)}</td>
              </tr>
            );
          })}
          {orders.length === 0 && (
            <tr><td colSpan={7} style={{ textAlign:"center", padding:32, color:"#aaa" }}>Chua co du lieu</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:80 }}>
      <div style={{ width:40, height:40, border:"3px solid #f0f0f0", borderTopColor:"#ee4d2d", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const S = {
  shell:         { display:"flex", minHeight:"100vh", fontFamily:"system-ui,sans-serif", background:"#f5f7fa" },
  sidebar:       { width:230, background:"#1e293b", display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100vh", flexShrink:0 },
  brand:         { display:"flex", alignItems:"center", gap:10, padding:"20px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)" },
  brandName:     { color:"white", fontWeight:800, fontSize:15 },
  brandSub:      { color:"rgba(255,255,255,0.4)", fontSize:11 },
  menuBtn:       { display:"flex", alignItems:"center", gap:10, width:"100%", padding:"12px 20px", background:"transparent", border:"none", color:"rgba(255,255,255,0.6)", fontSize:13, cursor:"pointer", position:"relative", transition:"all 0.15s", textAlign:"left" },
  menuBtnActive: { background:"rgba(238,77,45,0.15)", color:"white", fontWeight:600 },
  menuActiveLine:{ position:"absolute", left:0, top:0, bottom:0, width:3, background:"#ee4d2d", borderRadius:"0 2px 2px 0" },
  sideFooter:    { padding:16, borderTop:"1px solid rgba(255,255,255,0.07)" },
  adminInfo:     { display:"flex", gap:10, alignItems:"center", marginBottom:12 },
  adminAvatar:   { width:36, height:36, borderRadius:"50%", background:"#ee4d2d", color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:15, flexShrink:0 },
  sideBtn:       { flex:1, padding:"7px 0", background:"rgba(255,255,255,0.08)", border:"none", color:"rgba(255,255,255,0.6)", borderRadius:4, fontSize:12, cursor:"pointer" },
  main:          { flex:1, padding:28, overflow:"auto", maxWidth:"calc(100vw - 230px)" },
  statsGrid:     { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:14, marginBottom:20 },
  statCard:      { background:"white", borderRadius:10, padding:18, display:"flex", gap:14, alignItems:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" },
  statIcon:      { width:48, height:48, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 },
  dot:           { display:"inline-block", width:8, height:8, borderRadius:"50%" },
  table:         { width:"100%", borderCollapse:"collapse" },
  thead:         { background:"#f8fafc" },
  th:            { padding:"11px 14px", textAlign:"left", fontSize:12, fontWeight:700, color:"#64748b", borderBottom:"1px solid #f0f0f0", whiteSpace:"nowrap" },
  tr:            { borderBottom:"1px solid #f9fafb" },
  td:            { padding:"11px 14px", fontSize:13, color:"#374151", verticalAlign:"middle" },
  btnCreate:     { padding:"9px 18px", background:"#ee4d2d", color:"white", border:"none", borderRadius:6, fontSize:13, fontWeight:700, cursor:"pointer" },
  btnSave:       { padding:"10px 24px", background:"#ee4d2d", color:"white", border:"none", borderRadius:6, fontSize:14, fontWeight:700, cursor:"pointer" },
  btnCancelForm: { padding:"10px 20px", background:"#f5f5f5", color:"#555", border:"1px solid #ddd", borderRadius:6, fontSize:14, cursor:"pointer" },
  formLabel:     { display:"block", fontSize:12, fontWeight:600, color:"#555", marginBottom:5 },
  formInput:     { width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:4, fontSize:13, outline:"none", boxSizing:"border-box" },
  modalOverlay:  { position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, padding:16 },
  modalBox:      { background:"white", borderRadius:10, padding:28, width:"100%", maxWidth:600, maxHeight:"90vh", overflow:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.25)" },
};