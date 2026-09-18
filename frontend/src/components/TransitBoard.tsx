import { useEffect, useState, useCallback } from "react";
import ShipmentRow from "./ShipmentRow.js";
import SearchFilterBar from "./SearchFilterBar.js";
import HistoryRail from "./HistoryRail.js";
import CreateShipmentPanel from "./CreateShipmentPanel.js";
// @ts-ignore
import { fetchShipments, createShipment, updateShipmentStatus, fetchShipment } from "../api.js";

export default function TransitBoard() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [selected, setSelected] = useState<any | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchShipments({ search, status });
      setShipments(Array.isArray(data) ? data : data.shipments ?? []);
    } catch (err:any) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const t = setTimeout(load, search ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  async function handleAdvance(shipment: any, nextStatusValue: any) {
    setShipments((prev) =>
      prev.map((s) => (s.id === shipment.id ? { ...s, current_status: nextStatusValue } : s))
    );
    try {
      await updateShipmentStatus(shipment.id, nextStatusValue);
      load();
    } catch (err:any) {
      setLoadError(`Couldn't update ${shipment.reference_number}: ${err.message}`);
      load();
    }
  }

  async function handleOpenHistory(shipment: any) {
    setSelected(shipment);
    try {
      const full = await fetchShipment(shipment.id);
      setSelected(full);
    } catch (err:any) {
      setLoadError(`Couldn't load history: ${err.message}`);
    }
  }

  async function handleUpdateStatus(id: any, newStatus: any, note: any) {
    try {
      await updateShipmentStatus(id, newStatus, note);
      load();
      if (selected && selected.id === id) {
        const full = await fetchShipment(id);
        setSelected(full);
      }
    } catch (err:any) {
      setLoadError(`Couldn't update status: ${err.message}`);
    }
  }

  async function handleCreate(form: any) {
    setCreating(true);
    setCreateError(null);
    try {
      await createShipment(form);
      setCreateOpen(false);
      load();
      return true;
    } catch (err:any) {
      setCreateError(err.message);
      return false;
    } finally {
      setCreating(false);
    }
  }

  return (
    // Overlay container — panels slide in OVER the content, never squish it
    <div className="h-screen overflow-hidden relative" style={{ background: "var(--paper)" }}>

      {/* ── Main scrollable area ── always full-width ── */}
      <div className="h-full overflow-y-auto">
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 32px 60px" }}>

          {/* Header */}
          <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 30, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.5px", lineHeight: 1.2, margin: 0 }}>
                Shipments
              </h1>
              <p style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 6, marginBottom: 0 }}>
                Every line is a shipment. Position on the track is its status.
              </p>
            </div>
            <button
              onClick={() => { setCreateError(null); setCreateOpen(true); }}
              className="btn-primary"
              style={{ fontSize: 14, fontWeight: 600, padding: "10px 20px", whiteSpace: "nowrap", flexShrink: 0 }}
            >
              + New shipment
            </button>
          </header>

          {/* Search / filter */}
          <SearchFilterBar
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
          />

          {/* Error banner */}
          {loadError && (
            <div style={{
              marginTop: 12,
              padding: "10px 16px",
              borderRadius: 8,
              fontSize: 14,
              background: "var(--exception-soft)",
              color: "var(--exception)",
              border: "1px solid #fde68a",
            }}>
              {loadError}
            </div>
          )}

          {/* Shipment list card */}
          <div style={{
            marginTop: 16,
            borderRadius: 12,
            overflow: "hidden",
            background: "var(--panel)",
            boxShadow: "var(--shadow-sm)",
            border: "1px solid var(--track)",
          }}>
            {loading ? (
              <div style={{ padding: "80px 0", textAlign: "center", fontSize: 14, color: "var(--ink-muted)" }}>
                Loading shipments…
              </div>
            ) : shipments.length === 0 ? (
              <div style={{ padding: "80px 0", textAlign: "center", fontSize: 14, color: "var(--ink-muted)" }}>
                No shipments match. Try a different search, or create one.
              </div>
            ) : (
              shipments.map((s) => (
                <ShipmentRow
                  key={s.id}
                  shipment={s}
                  onOpenHistory={handleOpenHistory}
                  onAdvance={handleAdvance}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Overlay panels — slide in from edges, never squish the main content ── */}
      <HistoryRail shipment={selected} onClose={() => setSelected(null)} onUpdate={handleUpdateStatus} />
      <CreateShipmentPanel
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        submitting={creating}
        error={createError}
      />
    </div>
  );
}
