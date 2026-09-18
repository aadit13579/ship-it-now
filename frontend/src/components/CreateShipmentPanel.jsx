import { useState } from "react";

const EMPTY = {
  reference_number: "",
  origin: "",
  destination: "",
  expected_delivery: "",
  weight: "",
  priority: "Standard",
  delivery_notes: "",
};

export default function CreateShipmentPanel({ open, onClose, onSubmit, submitting, error }) {
  const [form, setForm] = useState(EMPTY);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.reference_number.trim()) delete payload.reference_number;
    if (payload.weight) payload.weight = parseFloat(payload.weight);
    const ok = await onSubmit(payload);
    if (ok) setForm(EMPTY);
  }

  const inputBase = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 8,
    border: "1.5px solid var(--track)",
    background: "var(--paper)",
    color: "var(--ink)",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    fontFamily: "inherit",
  };
  const monoInput = { ...inputBase, fontFamily: "'IBM Plex Mono', monospace" };

  const onFocus = (e) => {
    e.target.style.borderColor = "var(--line)";
    e.target.style.boxShadow = "0 0 0 3px var(--line-soft)";
  };
  const onBlur = (e) => {
    e.target.style.borderColor = "var(--track)";
    e.target.style.boxShadow = "none";
  };

  const labelStyle = {
    display: "block",
    fontSize: 12,
    fontWeight: 500,
    color: "var(--ink-soft)",
    marginBottom: 6,
    letterSpacing: "0.02em",
  };

  const required = <span style={{ color: "var(--line)", marginLeft: 2 }}>*</span>;

  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        height: "100%",
        width: 440,
        zIndex: 30,
        background: "var(--panel)",
        borderLeft: "1px solid var(--track)",
        boxShadow: open ? "var(--shadow-xl)" : "none",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1), box-shadow 0.28s ease",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Panel header */}
      <div style={{
        padding: "22px 24px 18px",
        borderBottom: "1px solid var(--track)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: "var(--ink)", letterSpacing: "-0.2px" }}>
          New shipment
        </div>
        <button
          onClick={onClose}
          title="Close"
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            lineHeight: 1,
            background: "var(--paper)",
            color: "var(--ink-soft)",
            cursor: "pointer",
            border: "1px solid var(--track)",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--track)"; e.currentTarget.style.color = "var(--ink)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--paper)"; e.currentTarget.style.color = "var(--ink-soft)"; }}
        >
          ×
        </button>
      </div>

      {/* Scrollable form body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Reference number */}
          <div>
            <label style={labelStyle}>Reference number</label>
            <input
              value={form.reference_number}
              onChange={(e) => update("reference_number", e.target.value)}
              style={monoInput}
              placeholder="Auto-generated if blank"
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Origin{required}</label>
              <input
                required
                value={form.origin}
                onChange={(e) => update("origin", e.target.value)}
                style={inputBase}
                placeholder="Shanghai"
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
            <div>
              <label style={labelStyle}>Destination{required}</label>
              <input
                required
                value={form.destination}
                onChange={(e) => update("destination", e.target.value)}
                style={inputBase}
                placeholder="Rotterdam"
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Expected delivery{required}</label>
            <input
              required
              type="date"
              value={form.expected_delivery}
              onChange={(e) => update("expected_delivery", e.target.value)}
              style={inputBase}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Weight (kg){required}</label>
              <input
                required
                type="number"
                min="0.1"
                step="0.1"
                value={form.weight}
                onChange={(e) => update("weight", e.target.value)}
                style={inputBase}
                placeholder="1200"
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
            <div>
              <label style={labelStyle}>Priority</label>
              <select
                value={form.priority}
                onChange={(e) => update("priority", e.target.value)}
                style={inputBase}
                onFocus={onFocus}
                onBlur={onBlur}
              >
                <option value="Standard">Standard</option>
                <option value="Express">Express</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Delivery notes</label>
            <input
              value={form.delivery_notes}
              onChange={(e) => update("delivery_notes", e.target.value)}
              style={inputBase}
              placeholder="Leave at loading dock B"
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          {error && (
            <div style={{
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: 13,
              background: "var(--exception-soft)",
              color: "var(--exception)",
              border: "1px solid #fde68a",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ width: "100%", padding: "12px", fontSize: 15, fontWeight: 600, marginTop: 4 }}
          >
            {submitting ? "Creating…" : "Create shipment"}
          </button>
        </form>
      </div>
    </div>
  );
}

