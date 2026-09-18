import { isException } from "../stages";

export default function HistoryRail({ shipment, onClose }) {
  const open = !!shipment;
  const history = shipment?.history ?? [];
  const chronological = [...history].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  return (
    <div
      className="h-full shrink-0 overflow-y-auto border-r transition-[width] duration-300 ease-out"
      style={{ width: open ? 400 : 0, borderColor: "var(--track)", background: "var(--panel)" }}
    >
      <div className="min-w-[400px] p-10">
        {shipment && (
          <>
            <button
              onClick={onClose}
              className="text-sm mb-10"
              style={{ color: "var(--ink-soft)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-soft)")}
            >
              Close
            </button>

            <div style={{ font: "600 21px 'IBM Plex Mono', monospace", color: "var(--ink)" }}>
              {shipment.reference_number}
            </div>
            <div className="text-sm mt-2 mb-12" style={{ color: "var(--ink-soft)" }}>
              {shipment.origin} <span style={{ color: "var(--line)" }}>→</span> {shipment.destination}
            </div>

            <div className="text-sm font-semibold mb-8" style={{ color: "var(--line)" }}>
              History
            </div>

            {chronological.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                No status changes recorded yet.
              </p>
            ) : (
              <div className="relative pl-7">
                <div
                  className="absolute left-[5px] top-1 bottom-1 w-px"
                  style={{ background: "var(--track)" }}
                />
                {chronological.map((entry, i) => {
                  const exception = isException(entry.status);
                  const color = exception ? "var(--exception)" : "var(--line)";
                  return (
                    <div key={i} className="relative pb-10 last:pb-0">
                      <div
                        className="absolute -left-7 top-1 w-3 h-3 rounded-full border-2"
                        style={{ background: color, borderColor: "var(--panel)" }}
                      />
                      <div className="text-sm font-semibold" style={{ color }}>
                        {entry.status}
                      </div>
                      <div
                        className="mt-1"
                        style={{
                          font: "400 12px 'IBM Plex Mono', monospace",
                          color: "var(--ink-soft)",
                        }}
                      >
                        {new Date(entry.created_at).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                      {entry.notes && (
                        <div className="text-sm mt-2" style={{ color: "var(--ink)" }}>
                          {entry.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}