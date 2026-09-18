import { useState, useEffect } from "react";
import { isException, ALL_STATUSES } from "../stages";

export default function HistoryRail({ shipment, onClose, onUpdate }) {
  const open = !!shipment;
  const history = shipment?.history ?? [];
  const chronological = [...history].sort(
    (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (shipment) {
      setStatus(shipment.current_status);
      setNote("");
    }
  }, [shipment]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!onUpdate || !shipment) return;
    setUpdating(true);
    await onUpdate(shipment.id, status, note);
    setUpdating(false);
    setNote("");
  }

  const isLate = shipment?.expected_delivery &&
    new Date() > new Date(shipment.expected_delivery) &&
    shipment.current_status !== "Delivered" &&
    shipment.current_status !== "Cancelled";

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        height: "100%",
        width: 360,
        zIndex: 30,
        background: "var(--panel)",
        borderRight: "1px solid var(--track)",
        boxShadow: open ? "var(--shadow-xl)" : "none",
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1), box-shadow 0.28s ease",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {shipment && (
        <>
          {/* Header */}
          <div style={{
            padding: "24px 24px 18px",
            borderBottom: "1px solid var(--track)",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <div style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontWeight: 600,
                    fontSize: 17,
                    color: "var(--ink)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {shipment.reference_number}
                  </div>
                  {isLate && (
                    <span style={{
                      display: "inline-block",
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "2px 7px",
                      borderRadius: 4,
                      background: "var(--exception-hard)",
                      color: "var(--exception-soft)",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}>
                      LATE
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                  {shipment.origin}
                  <span style={{ color: "var(--line)", margin: "0 5px" }}>→</span>
                  {shipment.destination}
                </div>
              </div>
              <button
                onClick={onClose}
                title="Close"
                style={{
                  flexShrink: 0,
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
          </div>

          {/* Scrollable timeline */}
          <div style={{ flex: 1, overflowY: "auto", padding: "22px 24px" }}>
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--ink-muted)",
              marginBottom: 18,
            }}>
              History
            </div>

            {chronological.length === 0 ? (
              <p style={{ fontSize: 14, color: "var(--ink-muted)" }}>
                No status changes recorded yet.
              </p>
            ) : (
              <div style={{ position: "relative", paddingLeft: 26, marginBottom: 20 }}>
                {/* Vertical timeline line */}
                <div style={{
                  position: "absolute",
                  left: 5,
                  top: 8,
                  bottom: 8,
                  width: 2,
                  background: "var(--track)",
                  borderRadius: 1,
                }} />

                {chronological.map((entry, i) => {
                  const exception = isException(entry.status);
                  const color = exception
                    ? "var(--exception)"
                    : entry.status === "Delivered"
                    ? "var(--delivered)"
                    : "var(--line)";
                  return (
                    <div key={i} style={{ position: "relative", paddingBottom: i < chronological.length - 1 ? 24 : 0 }}>
                      {/* Timeline dot */}
                      <div style={{
                        position: "absolute",
                        left: -26,
                        top: 4,
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: color,
                        border: "2.5px solid var(--panel)",
                        boxShadow: `0 0 0 1.5px ${color}`,
                      }} />
                      <div style={{ fontSize: 14, fontWeight: 600, color }}>
                        {entry.status}
                      </div>
                      <div style={{
                        fontSize: 12,
                        fontFamily: "'IBM Plex Mono', monospace",
                        color: "var(--ink-muted)",
                        marginTop: 3,
                      }}>
                        {new Date(entry.created_at).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                      {entry.notes && (
                        <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4, lineHeight: 1.5 }}>
                          {entry.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Update Form */}
            <div style={{
              marginTop: 20,
              paddingTop: 20,
              borderTop: "1px solid var(--track)",
            }}>
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--ink-muted)",
                marginBottom: 12,
              }}>
                Update Status
              </div>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--track)",
                    background: "var(--paper)",
                    color: "var(--ink)",
                    fontSize: 14,
                    outline: "none",
                  }}
                >
                  {ALL_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note (optional)"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid var(--track)",
                    background: "var(--paper)",
                    color: "var(--ink)",
                    fontSize: 14,
                    outline: "none",
                    resize: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={updating}
                  className="btn-primary"
                  style={{
                    padding: "8px 16px",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    alignSelf: "flex-end",
                    opacity: updating ? 0.7 : 1,
                  }}
                >
                  {updating ? "Updating..." : "Update"}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
