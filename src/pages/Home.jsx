import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../services/authService";
import api from "../services/api";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getUser());
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [tab, setTab] = useState("READY_MADE");
  const [data, setData] = useState({ readyMade: [], frames: [], lenses: [], contactLens: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [a, b, c, d] = await Promise.all([
          api.get("/admin/rmglasses/public/all"),
          api.get("/admin/frames/public/all"),
          api.get("/admin/lens/public/all"),
          api.get("/admin/contactlens/public/all"),
        ]);
        setData({
          readyMade: Array.isArray(a.data) ? a.data : [],
          frames: Array.isArray(b.data) ? b.data : [],
          lenses: Array.isArray(c.data) ? c.data : [],
          contactLens: Array.isArray(d.data) ? d.data : [],
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  const handleSearch = async () => {
    if (!keyword.trim()) { setSearchResults(null); return; }
    setSearchLoading(true);
    try {
      const res = await api.get("/search?keyword=" + encodeURIComponent(keyword));
      setSearchResults(res.data);
    } catch (e) { console.error(e); }
    finally { setSearchLoading(false); }
  };

  const handleLogout = () => { logout(); setUser(null); navigate("/"); };

  const requireLogin = () => {
    if (!user) { navigate("/login"); return false; }
    return true;
  };

  const addToCart = async (e, productType, productId, name) => {
    e.stopPropagation();
    if (!requireLogin()) return;
    try {
      await api.post("/cart/add", { productType, productId, quantity: 1 });
      alert("Da them vao gio hang: " + name);
    } catch (ex) { alert("Loi: " + (ex.response?.data?.message || ex.message)); }
  };

  const goDesign = (e) => {
    e && e.stopPropagation();
    if (!requireLogin()) return;
    navigate("/design-glasses");
  };

  const fmt = n => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

  const TABS = [
    { key: "READY_MADE", label: "Kinh co san", count: data.readyMade.length },
    { key: "FRAME", label: "Gong kinh", count: data.frames.length },
    { key: "LENS", label: "Trong kinh", count: data.lenses.length },
    { key: "CONTACT", label: "Kinh ap trong", count: data.contactLens.length },
  ];

  const getList = () => ({
    READY_MADE: data.readyMade,
    FRAME: data.frames,
    LENS: data.lenses,
    CONTACT: data.contactLens,
  }[tab] || []);

  const getInfo = (item) => {
    switch (tab) {
      case "READY_MADE": return {
        id: item.readyGlassesId, name: item.name,
        price: fmt(item.price),
        imageUrl: item.imageUrl || null,
        meta: "Do cau: " + (item.fixedSph || "-") + " | Do tru: " + (item.fixedCyl || "-"),
        canAdd: true, type: "READY_MADE", route: "ready-made",
      };
      case "FRAME": return {
        id: item.frameId, name: item.name,
        price: fmt(item.price),
        imageUrl: item.imageUrl || null,
        meta: [item.brand, item.material, item.size && "Size " + item.size].filter(Boolean).join(" • "),
        canAdd: false, type: "FRAME", route: "frame",
      };
      case "LENS": return {
        id: item.lensId, name: item.name,
        price: fmt(item.basePrice),
        imageUrl: item.imageUrl || null,
        meta: [item.lensType, item.minSph != null && "SPH " + item.minSph + "~" + item.maxSph].filter(Boolean).join(" • "),
        canAdd: false, type: "LENS", route: "lens",
      };
      case "CONTACT": return {
        id: item.contactLensId, name: item.name,
        price: fmt(item.price),
        imageUrl: item.imageUrl || null,
        meta: [item.contactType, item.minSph != null && "SPH " + item.minSph + "~" + item.maxSph].filter(Boolean).join(" • "),
        canAdd: true, type: "CONTACT_LENS", route: "contact",
      };
      default: return {};
    }
  };

  const SEARCH_SECS = [
    { key: "readyMadeGlasses", label: "Kinh co san", idKey: "readyGlassesId", priceKey: "price", type: "READY_MADE", canAdd: true, route: "ready-made" },
    { key: "frames", label: "Gong kinh", idKey: "frameId", priceKey: "price", type: "FRAME", canAdd: false, route: "frame" },
    { key: "lenses", label: "Trong kinh", idKey: "lensId", priceKey: "basePrice", type: "LENS", canAdd: false, route: "lens" },
    { key: "contactLenses", label: "Kinh ap trong", idKey: "contactLensId", priceKey: "price", type: "CONTACT_LENS", canAdd: true, route: "contact" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "system-ui,-apple-system,sans-serif" }}>

      {/* TOP BAR */}
      <div style={{ background: "#cc3d22", padding: "4px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", display: "flex", justifyContent: "flex-end", gap: 16 }}>
          {!user ? (
            <>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, cursor: "pointer" }} onClick={() => navigate("/register")}>Dang Ky</span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>|</span>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, cursor: "pointer" }} onClick={() => navigate("/login")}>Dang Nhap</span>
            </>
          ) : (
            <>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>Xin chao, {user?.name?.split(" ").pop() || user?.username}</span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>|</span>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, cursor: "pointer" }} onClick={handleLogout}>Dang Xuat</span>
            </>
          )}
        </div>
      </div>

      {/* HEADER */}
      <header style={{ background: "#ee4d2d", padding: "12px 0", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", position: "sticky", top: 0, zIndex: 1000 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", gap: 20 }}>
          <div onClick={() => navigate("/")} style={{ cursor: "pointer", flexShrink: 0, background: "white", borderRadius: 8, padding: "5px 14px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 22 }}>👓</span>
            <span style={{ color: "#ee4d2d", fontWeight: 800, fontSize: 18 }}>GlassesShop</span>
          </div>
          <div style={{ flex: 1, maxWidth: 560, display: "flex", background: "white", borderRadius: 4, overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <input
              style={{ flex: 1, padding: "2px 220px", border: "none", outline: "none", fontSize: 14, color: "#333" }}
              placeholder="Tim kiem san pham kinh mat..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
            <button onClick={handleSearch}
              style={{ padding: "0 20px", background: "#fb6520", color: "white", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Tim kiem
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto", flexShrink: 0 }}>
            {/* Nút Dashboard theo role */}
            {user && user.role === "ADMIN" && (
              <button onClick={() => navigate("/admin")}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 10px", background: "rgba(255,255,255,0.15)", border: "none", color: "white", cursor: "pointer", borderRadius: 4 }}>
                <span style={{ fontSize: 20 }}>⚙️</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>Admin</span>
              </button>
            )}
            {user && user.role === "STAFF" && (
              <button onClick={() => navigate("/staff")}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 10px", background: "rgba(255,255,255,0.15)", border: "none", color: "white", cursor: "pointer", borderRadius: 4 }}>
                <span style={{ fontSize: 20 }}>📋</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>Staff</span>
              </button>
            )}
            {user && user.role === "OPERATION" && (
              <button onClick={() => navigate("/operation")}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 10px", background: "rgba(255,255,255,0.15)", border: "none", color: "white", cursor: "pointer", borderRadius: 4 }}>
                <span style={{ fontSize: 20 }}>🔧</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>Operation</span>
              </button>
            )}
            {user && user.role === "SHIPPER" && (
              <button onClick={() => navigate("/shipper")}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 10px", background: "rgba(255,255,255,0.15)", border: "none", color: "white", cursor: "pointer", borderRadius: 4 }}>
                <span style={{ fontSize: 20 }}>🚚</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>Shipper</span>
              </button>
            )}
            {[
              { icon: "✏️", label: "Thiet Ke", action: e => goDesign(e) },
              { icon: "🛒", label: "Gio Hang", action: () => navigate("/cart") },
              { icon: "📦", label: "Don Hang", action: () => navigate("/orders") },
              ...(user ? [{ icon: "👤", label: user?.name?.split(" ").pop() || user?.username, action: () => navigate("/profile") }] : []),
            ].map(item => (
              <button key={item.label} onClick={item.action}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 10px", background: "transparent", border: "none", color: "white", cursor: "pointer", borderRadius: 4 }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 11 }}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: "8px auto 0", padding: "0 16px", display: "flex", gap: 20 }}>
          {["Kinh Can", "Kinh Mat", "Kinh Ap Trong", "Thiet Ke Theo Yeu Cau", "Freeship Toan Quoc"].map(t => (
            <span key={t} style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>{t}</span>
          ))}
        </div>
      </header>

      {/* BANNER */}
      {!searchResults && (
        <div style={{ background: "linear-gradient(135deg, #ee4d2d 0%, #ff7043 60%, #ffa726 100%)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", display: "grid", gridTemplateColumns: "1fr 300px", gap: 12, alignItems: "center", minHeight: 220 }}>
            <div style={{ padding: "32px 0", color: "white" }}>
              <div style={{ display: "inline-block", background: "rgba(255,255,255,0.2)", borderRadius: 4, padding: "3px 10px", fontSize: 12, fontWeight: 600, marginBottom: 12 }}>FREESHIP TOAN QUOC</div>
              <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.25, marginBottom: 10 }}>Kinh Mat Chat Luong<br/>Gia Tot Moi Ngay</h1>
              <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 22 }}>Thiet ke theo y ban — Hon 500+ mau kinh dang co san</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={e => goDesign(e)} style={{ padding: "11px 26px", background: "white", color: "#ee4d2d", border: "none", borderRadius: 4, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  Thiet ke kinh ngay
                </button>
                <button onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
                  style={{ padding: "11px 22px", background: "rgba(255,255,255,0.18)", color: "white", border: "2px solid rgba(255,255,255,0.6)", borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  Xem san pham
                </button>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "28px 36px", textAlign: "center" }}>
                <div style={{ fontSize: 88, lineHeight: 1 }}>👓</div>
                <div style={{ color: "white", fontWeight: 700, fontSize: 13, marginTop: 10, opacity: 0.9 }}>800.000+ Khach hang tin tuong</div>
              </div>
            </div>
          </div>
          <div style={{ background: "rgba(0,0,0,0.1)", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", display: "flex" }}>
              {[
                { icon: "🚚", title: "Freeship toan quoc", sub: "Don tu 200k" },
                { icon: "✅", title: "Chinh hang 100%", sub: "Bao hanh 12 thang" },
                { icon: "🔄", title: "Doi tra 30 ngay", sub: "Khong can ly do" },
                { icon: "💳", title: "Thanh toan an toan", sub: "Ma hoa SSL" },
                { icon: "🎨", title: "Thiet ke rieng", sub: "Theo do mat" },
              ].map((f, i) => (
                <div key={f.title} style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRight: i < 4 ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
                  <span style={{ fontSize: 22 }}>{f.icon}</span>
                  <div>
                    <div style={{ color: "white", fontWeight: 600, fontSize: 12 }}>{f.title}</div>
                    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MAIN */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px" }}>

        {/* SEARCH RESULTS */}
        {searchResults && (
          <div style={{ background: "white", borderRadius: 6, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Ket qua: "{keyword}"</h2>
              <button onClick={() => { setSearchResults(null); setKeyword(""); }}
                style={{ padding: "6px 14px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                Xoa tim kiem
              </button>
            </div>
            {searchLoading ? <Spinner /> : (
              <>
                {SEARCH_SECS.map(sec => searchResults[sec.key]?.length > 0 && (
                  <div key={sec.key} style={{ marginBottom: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <div style={{ width: 4, height: 18, background: "#ee4d2d", borderRadius: 2 }} />
                      <h3 style={{ fontSize: 15, fontWeight: 700 }}>{sec.label} ({searchResults[sec.key].length})</h3>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: 12 }}>
                      {searchResults[sec.key].map(p => (
                        <Card key={p[sec.idKey]}
                          name={p.name}
                          price={fmt(p[sec.priceKey])}
                          meta={p.brand || p.lensType || p.contactType || ""}
                          imageUrl={p.imageUrl || null}
                          onAdd={sec.canAdd ? e => addToCart(e, sec.type, p[sec.idKey], p.name) : null}
                          onDetail={() => navigate("/product/" + sec.route + "/" + p[sec.idKey])}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                {SEARCH_SECS.every(s => !searchResults[s.key]?.length) && (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>Khong tim thay san pham nao.</div>
                )}
              </>
            )}
          </div>
        )}

        {/* PRODUCTS */}
        {!searchResults && (
          <div id="products">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 4, height: 22, background: "#ee4d2d", borderRadius: 2 }} />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#333" }}>Danh Muc San Pham</h2>
            </div>
            <div style={{ background: "white", borderRadius: "6px 6px 0 0", display: "flex", borderBottom: "2px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflowX: "auto" }}>
              {TABS.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  style={{ flex: 1, minWidth: 120, padding: "14px 12px", border: "none", background: "white", borderBottom: tab === t.key ? "2px solid #ee4d2d" : "2px solid transparent", color: tab === t.key ? "#ee4d2d" : "#555", fontWeight: tab === t.key ? 700 : 500, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {t.label}
                  <span style={{ background: tab === t.key ? "#ee4d2d" : "#f0f0f0", color: tab === t.key ? "white" : "#888", borderRadius: 999, fontSize: 11, fontWeight: 700, padding: "1px 7px" }}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
            <div style={{ background: "white", borderRadius: "0 0 6px 6px", padding: "20px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", minHeight: 280 }}>
              {loading ? <Spinner /> : getList().length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>Chua co san pham.</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: 12 }}>
                  {getList().map(item => {
                    const info = getInfo(item);
                    return (
                      <Card key={info.id}
                        name={info.name}
                        price={info.price}
                        meta={info.meta}
                        imageUrl={info.imageUrl}
                        onAdd={info.canAdd ? e => addToCart(e, info.type, info.id, info.name) : null}
                        onDetail={() => navigate("/product/" + info.route + "/" + info.id)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ background: "#333", color: "#aaa", marginTop: 40, padding: "24px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>👓 GlassesShop</div>
            <div style={{ fontSize: 13 }}>Kinh mat chat luong — Gia tot moi ngay</div>
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 13 }}>
            {["Gioi thieu", "Lien he", "Chinh sach", "Bao mat"].map(t => (
              <span key={t} style={{ cursor: "pointer" }}>{t}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{ display: "inline-block", width: 36, height: 36, border: "3px solid #f0f0f0", borderTopColor: "#ee4d2d", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ✅ imageUrl là base64 từ DB → hiển thị trực tiếp
function Card({ name, price, meta, onAdd, onDetail, imageUrl }) {
  const [hov, setHov] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={onDetail}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ border: "1px solid " + (hov ? "#ee4d2d" : "#f0f0f0"), borderRadius: 6, overflow: "hidden", background: "white", cursor: "pointer", transition: "all 0.18s", boxShadow: hov ? "0 4px 16px rgba(238,77,45,0.15)" : "none", display: "flex", flexDirection: "column" }}>

      <div style={{ height: 170, background: "linear-gradient(145deg, #fff5f5, #fff0ee)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        {imageUrl && !imgError ? (
          <img src={imageUrl} alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={() => setImgError(true)} />
        ) : (
          <div style={{ width: 85, height: 85, background: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(238,77,45,0.12)", fontSize: 42 }}>
            🕶️
          </div>
        )}
        {onAdd && (
          <div style={{ position: "absolute", top: 8, right: 8, background: "#ee4d2d", color: "white", borderRadius: 4, fontSize: 10, fontWeight: 700, padding: "2px 6px" }}>
            CO SAN
          </div>
        )}
      </div>

      <div style={{ padding: "10px 12px 12px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#222", lineHeight: 1.4, marginBottom: 4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {name}
        </div>
        {meta && <div style={{ fontSize: 11, color: "#bbb", marginBottom: 6 }}>{meta}</div>}
        <div style={{ fontSize: 17, fontWeight: 700, color: "#ee4d2d", marginTop: "auto", marginBottom: 10 }}>{price}</div>
        {onAdd ? (
          <button onClick={e => { e.stopPropagation(); onAdd(e); }}
            style={{ width: "100%", padding: "8px 0", background: hov ? "#cc3d22" : "#ee4d2d", color: "white", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            + Them vao gio
          </button>
        ) : (
          <button onClick={e => { e.stopPropagation(); onDetail && onDetail(); }}
            style={{ width: "100%", padding: "8px 0", background: "white", color: "#ee4d2d", border: "1px solid #ee4d2d", borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Xem chi tiet
          </button>
        )}
      </div>
    </div>
  );
}