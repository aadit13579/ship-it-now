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
    const ok = await onSubmit(form);
    if (ok) setForm(EMPTY);
  }

  const field = "w-full bg-transparent border-b py-2.5 text-sm outline-none transition-colors";
  const focusHandlers = {
    onFocus: (e) => (e.target.style.borderColor = "var(--line)"),
    onBlur: (e) => (e.target.style.borderColor = "var(--track)"),
  };
  const fieldStyle = { borderColor: "var(--track)", color: "var(--ink)" };
  const label = "text-xs mb-2 block";
  const labelStyle = { color: "var(--ink-soft)" };

  return (
    <div
      className="h-full shrink-0 overflow-y-auto border-l transition-[width] duration-300 ease-out"
      style={{ width: open ? 440 : 0, borderColor: "var(--track)", background: "var(--panel)" }}
    >
      <div className="min-w-[440px] p-10">
        <button
          onClick={onClose}
          className="text-sm mb-10"
          style={{ color: "var(--ink-soft)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-soft)")}
        >
          Close
        </button>

        <div className="text-lg font-semibold mb-10" style={{ color: "var(--line)" }}>
          New shipment
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className={label} style={labelStyle}>
              Reference number (optional — auto-generated if blank)
            </label>
            <input
              value={form.reference_number}
              onChange={(e) => update("reference_number", e.target.value)}
              className={field}
              style={{ ...fieldStyle, font: "400 14px 'IBM Plex Mono', monospace" }}
              placeholder="SHIP-00001"
              {...focusHandlers}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={label} style={labelStyle}>Origin</label>
              <input
                required
                value={form.origin}
                onChange={(e) => update("origin", e.target.value)}
                className={field}
                style={fieldStyle}
                placeholder="Shanghai"
                {...focusHandlers}
              />
            </div>
            <div>
              <label className={label} style={labelStyle}>Destination</label>
              <input
                required
                value={form.destination}
                onChange={(e) => update("destination", e.target.value)}
                className={field}
                style={fieldStyle}
                placeholder="Rotterdam"
                {...focusHandlers}
              />
            </div>
          </div>

          <div>
            <label className={label} style={labelStyle}>Expected delivery date</label>
            <input
              required
              type="date"
              value={form.expected_delivery}
              onChange={(e) => update("expected_delivery", e.target.value)}
              className={field}
              style={fieldStyle}
              {...focusHandlers}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={label} style={labelStyle}>Weight (kg)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.weight}
                onChange={(e) => update("weight", e.target.value)}
                className={field}
                style={fieldStyle}
                placeholder="1200"
                {...focusHandlers}
              />
            </div>
            <div>
              <label className={label} style={labelStyle}>Priority</label>
              <select
                value={form.priority}
                onChange={(e) => update("priority", e.target.value)}
                className={field}
                style={fieldStyle}
                {...focusHandlers}
              >
                <option value="Standard">Standard</option>
                <option value="Express">Express</option>
              </select>
            </div>
          </div>

          <div>
            <label className={label} style={labelStyle}>Delivery notes (optional)</label>
            <input
              value={form.delivery_notes}
              onChange={(e) => update("delivery_notes", e.target.value)}
              className={field}
              style={fieldStyle}
              placeholder="Leave at loading dock B"
              {...focusHandlers}
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: "var(--exception)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full text-sm font-medium px-6 py-3.5 disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create shipment"}
          </button>
        </form>
      </div>
    </div>
  );
}