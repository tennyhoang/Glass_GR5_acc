import { useState, useRef } from "react";

// Props:
//   value: base64 hiện tại (nếu đang edit)
//   onChange: callback(base64String) khi chọn ảnh
//   label: nhãn hiển thị

export default function ImageUpload({ value, onChange, label = "Anh san pham" }) {
  const [preview, setPreview] = useState(value || null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Chi chap nhan file anh (jpg, png...)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("File qua lon! Toi da 2MB.");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setPreview(base64);
      onChange && onChange(base64); // ✅ Trả base64 về form, lưu vào DB
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange && onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>
        {label}
      </label>

      <div onClick={() => inputRef.current?.click()}
        style={{
          width: "100%", height: 150,
          border: "2px dashed " + (preview ? "#ee4d2d" : "#e5e7eb"),
          borderRadius: 8, overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", background: preview ? "#fff5f5" : "#fafafa",
        }}>
        {preview ? (
          <img src={preview} alt="preview"
            style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        ) : (
          <div style={{ textAlign: "center", color: "#aaa" }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>📷</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>Nhan de chon anh</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>JPG, PNG — Toi da 2MB</div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        <button type="button" onClick={() => inputRef.current?.click()}
          style={{ flex: 1, padding: "7px 0", background: "#f0f0f0", color: "#555", border: "none", borderRadius: 4, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
          {preview ? "Doi anh khac" : "Chon anh"}
        </button>
        {preview && (
          <button type="button" onClick={handleRemove}
            style={{ padding: "7px 12px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 4, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
            Xoa
          </button>
        )}
      </div>

      {error && (
        <div style={{ marginTop: 6, fontSize: 12, color: "#dc2626", background: "#fee2e2", padding: "4px 8px", borderRadius: 4 }}>
          {error}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*"
        onChange={handleFile} style={{ display: "none" }} />
    </div>
  );
}