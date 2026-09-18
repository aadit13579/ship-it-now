import TrackLine from "./TrackLine";
import { isException } from "../stages";

function statusColor(status) {
  if (isException(status)) return "var(--exception)";
  if (status === "Delivered") return "var(--delivered)";
  return "var(--line)";
}

export default function ShipmentRow({ shipment, onOpenHistory, onAdvance }) {
  const exception = isException(shipment.current_status);
  const color = statusColor(shipment.current_status);
  const eta = shipment.expected_delivery
    ? new Date(shipment.expected_delivery).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "—";

  const isLate = shipment.expected_delivery &&
    new Date() > new Date(shipment.expected_delivery) &&
    shipment.current_status !== "Delivered" &&
    shipment.current_status !== "Cancelled";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "210px minmax(0,1fr) 150px",
        alignItems: "center",
        gap: "20px",
        padding: "18px 20px",
        borderBottom: "1px solid var(--track)",
        cursor: "pointer",
        transition: "background 0.12s",
        borderLeft: `3px solid ${color}`,
      }}
      onClick={() => onOpenHistory(shipment)}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--panel-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 600,
          fontSize: 13,
          color: "var(--ink)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {shipment.reference_number}
        </div>
        <div style={{
          fontSize: 12,
          marginTop: 3,
          color: "var(--ink-soft)",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          wordBreak: "break-word",
        }}>
          {shipment.origin}
          <span style={{ color: "var(--line)", margin: "0 4px" }}>→</span>
          {shipment.destination}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
          {shipment.priority && (
            <span style={{
              display: "inline-block",
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: 4,
              background: exception ? "var(--exception-soft)" : "var(--line-soft)",
              color: exception ? "var(--exception)" : "var(--line)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}>
              {shipment.priority}
            </span>
          )}
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
      </div>
      <div style={{ minWidth: 0 }} onClick={(e) => e.stopPropagation()}>
        <TrackLine
          status={shipment.current_status}
          interactive={shipment.current_status !== "Delivered" && shipment.current_status !== "Cancelled"}
          onAdvance={(next) => onAdvance(shipment, next)}
        />
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color }}>{shipment.current_status}</div>
        <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: "var(--ink-muted)", marginTop: 3 }}>
          ETA {eta}
        </div>
      </div>
    </div>
  );
}
