// @ts-ignore
import { ALL_STATUSES } from "../stages";

export default function SearchFilterBar({ search, onSearchChange, status, onStatusChange }: any) {
  const inputStyle = {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1.5px solid var(--track)",
    background: "var(--paper)",
    color: "var(--ink)",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };
  const focus = (e: any) => { e.target.style.borderColor = "var(--line)"; e.target.style.boxShadow = "0 0 0 3px var(--line-soft)"; };
  const blur  = (e: any) => { e.target.style.borderColor = "var(--track)"; e.target.style.boxShadow = "none"; };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "12px 14px",
      borderRadius: 10,
      background: "var(--panel)",
      border: "1px solid var(--track)",
      boxShadow: "var(--shadow-sm)",
      marginBottom: 4,
    }}>
      <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
        <svg
          style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "var(--ink-muted)", pointerEvents: "none" }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search shipments…"
          style={{
            ...inputStyle,
            width: "100%",
            paddingLeft: 32,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 13,
          }}
          onFocus={focus}
          onBlur={blur}
        />
      </div>

      {/* Status filter */}
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        style={{ ...inputStyle, cursor: "pointer" }}
        onFocus={focus}
        onBlur={blur}
      >
        <option value="">All statuses</option>
        {ALL_STATUSES.map((s: string) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}
