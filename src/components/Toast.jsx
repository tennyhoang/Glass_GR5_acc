import { useState, useEffect, createContext, useContext, useCallback } from "react";

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ message, type = "success", duration = 3000 }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const ICONS = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  const COLORS = {
    success: { bg: "#f0fdf4", border: "#86efac", color: "#16a34a" },
    error:   { bg: "#fef2f2", border: "#fca5a5", color: "#dc2626" },
    warning: { bg: "#fffbeb", border: "#fcd34d", color: "#d97706" },
    info:    { bg: "#eff6ff", border: "#93c5fd", color: "#2563eb" },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div style={{
        position: "fixed", top: 16, right: 16,
        display: "flex", flexDirection: "column", gap: 8,
        zIndex: 99999, maxWidth: 360,
      }}>
        {toasts.map(t => {
          const c = COLORS[t.type] || COLORS.success;
          return (
            <div key={t.id} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              background: c.bg, border: "1px solid " + c.border,
              borderRadius: 8, padding: "12px 16px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              animation: "slideIn 0.25s ease-out",
              minWidth: 280,
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{ICONS[t.type]}</span>
              <span style={{ fontSize: 14, color: c.color, fontWeight: 500, lineHeight: 1.4 }}>
                {t.message}
              </span>
              <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: c.color, fontSize: 16, padding: 0, flexShrink: 0, opacity: 0.6 }}>
                ✕
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}