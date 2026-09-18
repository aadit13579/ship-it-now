import { ALL_STATUSES } from "../stages";

export default function SearchFilterBar({ search, onSearchChange, status, onStatusChange, onCreate }) {
  return (
    <div className="flex items-center gap-6 px-10 py-7 border-b" style={{ borderColor: "var(--track)" }}>
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by reference number"
        className="flex-1 max-w-xs bg-transparent border-b py-2 text-sm outline-none transition-colors"
        style={{
          borderColor: "var(--track)",
          color: "var(--ink)",
          font: "400 13px 'IBM Plex Mono', monospace",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--line)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--track)")}
      />

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="bg-transparent border-b py-2 text-sm outline-none transition-colors"
        style={{ borderColor: "var(--track)", color: "var(--ink)" }}
        onFocus={(e) => (e.target.style.borderColor = "var(--line)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--track)")}
      >
        <option value="">All statuses</option>
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <div className="flex-1" />

      <button onClick={onCreate} className="btn-primary text-sm font-medium px-6 py-3">
        New shipment
      </button>
    </div>
  );
}