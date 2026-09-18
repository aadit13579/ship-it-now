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

  return (
    <div
      className="grid grid-cols-[260px_1fr_170px] items-center gap-10 py-8 pl-7 pr-10 border-b cursor-pointer transition-colors"
      style={{ borderColor: "var(--track)", borderLeft: `4px solid ${color}` }}
      onClick={() => onOpenHistory(shipment)}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--line-soft)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div>
        <div style={{ font: "600 15px 'IBM Plex Mono', monospace", color: "var(--ink)" }}>
          {shipment.reference_number}
        </div>
        <div className="text-sm mt-2">
          <span style={{ color: "var(--ink)" }}>{shipment.origin}</span>
          <span style={{ color: "var(--line)", margin: "0 6px" }}>→</span>
          <span style={{ color: "var(--ink)" }}>{shipment.destination}</span>
        </div>
        {shipment.priority && (
          <span
            className="inline-block text-xs mt-3 px-2 py-1"
            style={{
              background: exception ? "var(--exception-soft)" : "var(--line-soft)",
              color: exception ? "var(--exception)" : "var(--line)",
            }}
          >
            {shipment.priority}
          </span>
        )}
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <TrackLine
          status={shipment.current_status}
          interactive={shipment.current_status !== "Delivered"}
          onAdvance={(next) => onAdvance(shipment, next)}
        />
      </div>

      <div className="text-right">
        <div className="text-sm font-semibold" style={{ color }}>
          {shipment.current_status}
        </div>
        <div
          className="mt-2"
          style={{ font: "400 12px 'IBM Plex Mono', monospace", color: "var(--ink-soft)" }}
        >
          ETA {eta}
        </div>
      </div>
    </div>
  );
}