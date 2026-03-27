import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUser } from "../services/authService";
import api from "../services/api";

const STEPS = [
  { key: 0, label: "Ho so mat", icon: "👁️" },
  { key: 1, label: "Gong kinh", icon: "🕶️" },
  { key: 2, label: "Trong kinh", icon: "🔍" },
  { key: 3, label: "Tuy chon", icon: "⚙️" },
  { key: 4, label: "Xac nhan", icon: "✅" },
];

export default function DesignGlasses() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [eyeProfiles, setEyeProfiles] = useState([]);
  const [frames, setFrames] = useState([]);
  const [lenses, setLenses] = useState([]);
  const [lensOptions, setLensOptions] = useState([]);

  const [selected, setSelected] = useState({
    eyeProfileId: location.state?.eyeProfileId || null,
    frameId: null,
    lensId: null,
    selectedOptionIds: [],
    designName: "",
  });

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Fetch eye profiles (requires auth)
      const epRes = await api.get("/api/eye-profiles/me");
      const raw = epRes.data;
      // Handle both { data: [...] } and [...] formats
      const profiles = Array.isArray(raw) ? raw
        : Array.isArray(raw?.data) ? raw.data
        : Array.isArray(raw?.content) ? raw.content
        : [];
      setEyeProfiles(profiles.filter(p => p.status === "ACTIVE"));

      // Fetch public endpoints (no auth needed but axios sends token anyway)
      const [frRes, lnRes] = await Promise.all([
        api.get("/admin/frames/public/all"),
        api.get("/admin/lens/public/all"),
      ]);
      setFrames(Array.isArray(frRes.data) ? frRes.data.filter(f => f.status === "ACTIVE") : []);
      setLenses(Array.isArray(lnRes.data) ? lnRes.data.filter(l => l.status === "ACTIVE") : []);

      // Try lens options - public endpoint
      try {
        const loRes = await api.get("/admin/lensoption/public/all");
        const loData = loRes.data;
        setLensOptions(Array.isArray(loData) ? loData : Array.isArray(loData?.data) ? loData.data : []);
      } catch {
        // LensOption public endpoint may not exist yet, skip silently
        setLensOptions([]);
      }

    } catch (e) {
      console.error("Error loading design data:", e);
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 0) return !!selected.eyeProfileId;
    if (step === 1) return !!selected.frameId;
    if (step === 2) return !!selected.lensId;
    return true;
  };

  const toggleOption = (id) => {
    setSelected(prev => ({
      ...prev,
      selectedOptionIds: prev.selectedOptionIds.includes(id)
        ? prev.selectedOptionIds.filter(x => x !== id)
        : [...prev.selectedOptionIds, id],
    }));
  };

  const fmt = n => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n || 0);

  const selectedFrame = frames.find(f => f.frameId === selected.frameId);
  const selectedLens = lenses.find(l => l.lensId === selected.lensId);
  const selectedProfile = eyeProfiles.find(p => p.eyeProfileId === selected.eyeProfileId);
  const selectedOpts = lensOptions.filter(o => selected.selectedOptionIds.includes(o.lensOptionId));
  const totalPrice = (selectedFrame?.price || 0) + (selectedLens?.basePrice || 0)
    + selectedOpts.reduce((s, o) => s + (o.extraPrice || 0), 0);

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const designRes = await api.post("/api/glasses-designs", {
        eyeProfileId: selected.eyeProfileId,
        frameId: selected.frameId,
        lensId: selected.lensId,
        selectedOptionIds: selected.selectedOptionIds,
        designName: selected.designName || "Thiet ke cua toi",
      });
      const design = designRes.data?.data || designRes.data;

      const snapRes = await api.post("/api/glasses-designs/" + design.designId + "/snapshot");
      const myGlasses = snapRes.data?.data || snapRes.data;

      await api.post("/cart/add", {
        productType: "MY_GLASSES",
        productId: myGlasses.myGlassesId,
        quantity: 1,
      });
      alert("Da them kinh thiet ke vao gio hang!");
      navigate("/cart");
    } catch (e) {
      alert("Loi: " + (e.response?.data?.message || e.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
      <div style={SS.spinner} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={S.page}>
      {/* NAV */}
      <nav style={S.nav}>
        <div style={S.navInner}>
          <div style={S.logo} onClick={() => navigate("/")}>👓 GlassesShop</div>
          <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600, fontSize: 15 }}>
            Thiet Ke Kinh Theo Yeu Cau
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button style={S.navBtn} onClick={() => navigate("/eye-profile")}>Ho so mat</button>
            <button style={S.navBtn} onClick={() => navigate("/cart")}>Gio hang</button>
          </div>
        </div>
      </nav>

      <div style={S.container}>
        {/* STEPPER */}
        <div style={S.stepperWrap}>
          <div style={S.stepper}>
            {STEPS.map((s, i) => (
              <div key={s.key} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: i < step ? "pointer" : "default" }}
                  onClick={() => i < step && setStep(i)}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: i < step ? "#16a34a" : i === step ? "#ee4d2d" : "white",
                    border: i > step ? "2px solid #e5e7eb" : "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: i < step ? 18 : 20,
                    color: i > step ? "#ccc" : "white",
                    boxShadow: i === step ? "0 4px 14px rgba(238,77,45,0.35)" : "none",
                    transition: "all 0.3s",
                  }}>
                    {i < step ? "✓" : s.icon}
                  </div>
                  <span style={{
                    fontSize: 11, whiteSpace: "nowrap",
                    fontWeight: i === step ? 700 : 500,
                    color: i === step ? "#ee4d2d" : i < step ? "#16a34a" : "#bbb",
                  }}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    width: 64, height: 2, margin: "0 6px 22px",
                    background: i < step ? "#16a34a" : "#e5e7eb",
                    transition: "all 0.3s",
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* BODY */}
        <div style={S.body}>
          {/* MAIN PANEL */}
          <div style={S.mainPanel}>

            {/* STEP 0 — EYE PROFILE */}
            {step === 0 && (
              <Panel title="Chon Ho So Mat" sub="Chon ho so mat phu hop voi don thuoc cua ban">
                {eyeProfiles.length === 0 ? (
                  <div style={SS.empty}>
                    <div style={{ fontSize: 52, marginBottom: 12 }}>👁️</div>
                    <p style={{ color: "#888", marginBottom: 16 }}>Ban chua co ho so mat nao hoac chua dang nhap!</p>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button style={SS.btnPrimary} onClick={() => navigate("/eye-profile")}>
                        + Tao ho so mat
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={SS.grid}>
                    {eyeProfiles.map(p => (
                      <SelCard key={p.eyeProfileId}
                        active={selected.eyeProfileId === p.eyeProfileId}
                        onClick={() => setSelected({ ...selected, eyeProfileId: p.eyeProfileId })}>
                        <div style={{ fontSize: 36, marginBottom: 8 }}>👁️</div>
                        <div style={SS.cardTitle}>{p.profileName}</div>
                        <div style={SS.cardSub}>
                          {p.source === "MANUAL" ? "Nhap tay" : "Upload"}{" "}
                          {p.createdDate ? "• " + new Date(p.createdDate).toLocaleDateString("vi-VN") : ""}
                        </div>
                        {p.prescriptions?.length > 0 && (
                          <div style={{ marginTop: 8, fontSize: 11, background: "#f5f5f5", borderRadius: 4, padding: "4px 8px" }}>
                            {p.prescriptions.map(rx => (
                              <div key={rx.prescriptionId} style={{ color: "#555" }}>
                                {rx.eyeSide === "RIGHT" ? "P" : "T"}: SPH {rx.sph ?? 0} / CYL {rx.cyl ?? 0}
                              </div>
                            ))}
                          </div>
                        )}
                      </SelCard>
                    ))}
                  </div>
                )}
              </Panel>
            )}

            {/* STEP 1 — FRAME */}
            {step === 1 && (
              <Panel title="Chon Gong Kinh" sub="Chon gong kinh phu hop voi phong cach cua ban">
                {frames.length === 0 ? (
                  <div style={SS.empty}>
                    <div style={{ fontSize: 52, marginBottom: 12 }}>🕶️</div>
                    <p style={{ color: "#888" }}>Chua co gong kinh nao trong he thong</p>
                  </div>
                ) : (
                  <div style={SS.grid}>
                    {frames.map(f => (
                      <SelCard key={f.frameId}
                        active={selected.frameId === f.frameId}
                        onClick={() => setSelected({ ...selected, frameId: f.frameId })}>
                        <div style={{ fontSize: 36, marginBottom: 8 }}>🕶️</div>
                        <div style={SS.cardTitle}>{f.name}</div>
                        <div style={SS.cardSub}>{f.brand} • {f.material}</div>
                        <div style={SS.cardSub}>{f.color} • Size {f.size}</div>
                        <div style={{ marginTop: 8, fontSize: 15, fontWeight: 700, color: "#ee4d2d" }}>{fmt(f.price)}</div>
                      </SelCard>
                    ))}
                  </div>
                )}
              </Panel>
            )}

            {/* STEP 2 — LENS */}
            {step === 2 && (
              <Panel title="Chon Trong Kinh" sub="Chon trong kinh phu hop voi do mat cua ban">
                {lenses.length === 0 ? (
                  <div style={SS.empty}>
                    <div style={{ fontSize: 52, marginBottom: 12 }}>🔍</div>
                    <p style={{ color: "#888" }}>Chua co trong kinh nao trong he thong</p>
                  </div>
                ) : (
                  <div style={SS.grid}>
                    {lenses.map(l => (
                      <SelCard key={l.lensId}
                        active={selected.lensId === l.lensId}
                        onClick={() => setSelected({ ...selected, lensId: l.lensId })}>
                        <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
                        <div style={SS.cardTitle}>{l.name}</div>
                        <div style={SS.cardSub}>{l.lensType}</div>
                        <div style={SS.cardSub}>SPH: {l.minSph} ~ {l.maxSph}</div>
                        <div style={{ marginTop: 8, fontSize: 15, fontWeight: 700, color: "#ee4d2d" }}>{fmt(l.basePrice)}</div>
                      </SelCard>
                    ))}
                  </div>
                )}
              </Panel>
            )}

            {/* STEP 3 — OPTIONS */}
            {step === 3 && (
              <Panel title="Tuy Chon Them" sub="Chon them cac tinh nang bo sung (khong bat buoc)">
                {lensOptions.length === 0 ? (
                  <div style={SS.empty}>
                    <div style={{ fontSize: 52, marginBottom: 12 }}>⚙️</div>
                    <p style={{ color: "#888" }}>Khong co tuy chon them nao</p>
                    <p style={{ color: "#bbb", fontSize: 12, marginTop: 8 }}>Ban co the tiep tuc ma khong can chon</p>
                  </div>
                ) : (
                  <div style={SS.grid}>
                    {lensOptions.map(o => (
                      <SelCard key={o.lensOptionId}
                        active={selected.selectedOptionIds.includes(o.lensOptionId)}
                        onClick={() => toggleOption(o.lensOptionId)}
                        multi>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>⚙️</div>
                        <div style={SS.cardTitle}>{o.optionName || (o.indexValue + " Index")}</div>
                        {o.indexValue && <div style={SS.cardSub}>Chiet suat: {o.indexValue}</div>}
                        {o.coating && <div style={SS.cardSub}>Lop phu: {o.coating}</div>}
                        <div style={{ marginTop: 8, fontSize: 14, fontWeight: 700, color: "#16a34a" }}>+ {fmt(o.extraPrice)}</div>
                      </SelCard>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: 20 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 8 }}>
                    Ten thiet ke (tuy chon)
                  </label>
                  <input
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #ddd", borderRadius: 4, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                    placeholder="VD: Kinh can cua toi"
                    value={selected.designName}
                    onChange={e => setSelected({ ...selected, designName: e.target.value })}
                  />
                </div>
              </Panel>
            )}

            {/* STEP 4 — CONFIRM */}
            {step === 4 && (
              <Panel title="Xac Nhan Thiet Ke" sub="Kiem tra lai truoc khi them vao gio hang">
                <div style={{ background: "#fafafa", borderRadius: 8, overflow: "hidden", border: "1px solid #f0f0f0" }}>
                  {[
                    ["Ho so mat", selectedProfile?.profileName],
                    ["Gong kinh", selectedFrame ? selectedFrame.name + " (" + selectedFrame.brand + ")" : null],
                    ["Trong kinh", selectedLens?.name],
                    ["Tuy chon", selectedOpts.length > 0 ? selectedOpts.map(o => o.optionName || o.coating || "Option").join(", ") : "Khong co"],
                    ["Ten thiet ke", selected.designName || "Thiet ke cua toi"],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #f0f0f0" }}>
                      <span style={{ color: "#888", fontSize: 14 }}>{label}</span>
                      <span style={{ fontWeight: 600, fontSize: 14, maxWidth: "55%", textAlign: "right" }}>{value || <span style={{ color: "#ccc" }}>Chua chon</span>}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "18px 20px", background: "#fff5f5" }}>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>Tong gia uoc tinh</span>
                    <span style={{ fontWeight: 800, fontSize: 22, color: "#ee4d2d" }}>{fmt(totalPrice)}</span>
                  </div>
                </div>
              </Panel>
            )}

            {/* NAVIGATION */}
            <div style={{ display: "flex", marginTop: 24, paddingTop: 20, borderTop: "1px solid #f0f0f0" }}>
              {step > 0 && (
                <button style={SS.btnBack} onClick={() => setStep(step - 1)}>← Quay lai</button>
              )}
              <div style={{ marginLeft: "auto" }}>
                {step < STEPS.length - 1 ? (
                  <button
                    style={{ ...SS.btnNext, opacity: canNext() ? 1 : 0.5, cursor: canNext() ? "pointer" : "not-allowed" }}
                    onClick={() => canNext() && setStep(step + 1)}
                    disabled={!canNext()}>
                    Tiep theo →
                  </button>
                ) : (
                  <button
                    style={{ ...SS.btnNext, opacity: submitting ? 0.7 : 1 }}
                    onClick={handleFinish}
                    disabled={submitting}>
                    {submitting ? "Dang xu ly..." : "Them vao gio hang 🛒"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div style={S.sidebar}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "#111" }}>Thiet ke hien tai</h3>
            {[
              { icon: "👁️", label: "HO SO MAT", value: selectedProfile?.profileName },
              { icon: "🕶️", label: "GONG KINH", value: selectedFrame?.name },
              { icon: "🔍", label: "TRONG KINH", value: selectedLens?.name },
              { icon: "⚙️", label: "TUY CHON", value: selectedOpts.length > 0 ? selectedOpts.length + " lua chon" : null },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 10, color: "#aaa", fontWeight: 700, letterSpacing: 1, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: item.value ? "#333" : "#ccc" }}>
                    {item.value || "Chua chon"}
                  </div>
                </div>
              </div>
            ))}

            {totalPrice > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid #f0f0f0", marginTop: 4, fontSize: 14 }}>
                <span>Tam tinh</span>
                <strong style={{ color: "#ee4d2d" }}>{fmt(totalPrice)}</strong>
              </div>
            )}

            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: 12, marginTop: 16, textAlign: "center" }}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>💡</div>
              <p style={{ fontSize: 12, color: "#92400e", lineHeight: 1.5, margin: 0 }}>
                Kinh thiet ke theo yeu cau duoc lam thu cong chat luong cao, thoi gian san xuat 3-5 ngay lam viec.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, sub, children }) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 4 }}>{title}</h2>
        <p style={{ fontSize: 13, color: "#888" }}>{sub}</p>
      </div>
      {children}
    </div>
  );
}

function SelCard({ active, onClick, children, multi }) {
  return (
    <div onClick={onClick} style={{
      border: "2px solid " + (active ? "#ee4d2d" : "#e5e7eb"),
      borderRadius: 8, padding: 16, cursor: "pointer",
      background: active ? "#fff5f5" : "white",
      textAlign: "center", transition: "all 0.18s",
      position: "relative",
      boxShadow: active ? "0 4px 14px rgba(238,77,45,0.15)" : "none",
    }}>
      {active && (
        <div style={{ position: "absolute", top: 8, right: 8, width: 22, height: 22, background: "#ee4d2d", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700 }}>
          ✓
        </div>
      )}
      {children}
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", background: "#f5f5f5", fontFamily: "system-ui,sans-serif" },
  nav: { background: "#ee4d2d", height: 56, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", position: "sticky", top: 0, zIndex: 100 },
  navInner: { maxWidth: 1100, margin: "0 auto", height: "100%", padding: "0 16px", display: "flex", alignItems: "center", gap: 16 },
  logo: { fontSize: 18, fontWeight: 800, color: "white", cursor: "pointer", flexShrink: 0 },
  navBtn: { background: "transparent", border: "none", color: "white", fontSize: 13, cursor: "pointer", padding: "6px 10px" },
  container: { maxWidth: 1100, margin: "0 auto", padding: "24px 16px" },
  stepperWrap: { background: "white", borderRadius: 8, padding: "20px 24px", marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
  stepper: { display: "flex", alignItems: "flex-start", justifyContent: "center" },
  body: { display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, alignItems: "start" },
  mainPanel: { background: "white", borderRadius: 8, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
  sidebar: { background: "white", borderRadius: 8, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", position: "sticky", top: 76 },
};

const SS = {
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 },
  cardTitle: { fontWeight: 600, fontSize: 13, marginBottom: 4, color: "#222", lineHeight: 1.4 },
  cardSub: { fontSize: 11, color: "#999", marginBottom: 2 },
  empty: { textAlign: "center", padding: "48px 0" },
  btnPrimary: { padding: "10px 20px", background: "#ee4d2d", color: "white", border: "none", borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  btnBack: { padding: "10px 20px", background: "#f5f5f5", color: "#555", border: "1px solid #ddd", borderRadius: 4, fontSize: 14, cursor: "pointer" },
  btnNext: { padding: "11px 28px", background: "#ee4d2d", color: "white", border: "none", borderRadius: 4, fontSize: 14, fontWeight: 700, cursor: "pointer" },
  spinner: { width: 40, height: 40, border: "3px solid #f0f0f0", borderTopColor: "#ee4d2d", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
};