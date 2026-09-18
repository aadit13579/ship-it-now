import { useEffect, useState, useCallback } from "react";
import ShipmentRow from "./ShipmentRow.jsx";
import SearchFilterBar from "./SearchFilterBar.jsx";
import HistoryRail from "./HistoryRail.jsx";
import CreateShipmentPanel from "./CreateShipmentPanel.jsx";
import { fetchShipments, createShipment, updateShipmentStatus, fetchShipment } from "../api";

export default function TransitBoard() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [selected, setSelected] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchShipments({ search, status });
      setShipments(Array.isArray(data) ? data : data.shipments ?? []);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const t = setTimeout(load, search ? 250 : 0); // debounce typed search only
    return () => clearTimeout(t);
  }, [load, search]);

  async function handleAdvance(shipment, nextStatusValue) {
    // Optimistic update so the board feels immediate.
    setShipments((prev) =>
      prev.map((s) => (s.id === shipment.id ? { ...s, current_status: nextStatusValue } : s))
    );
    try {
      await updateShipmentStatus(shipment.id, nextStatusValue);
      load();
    } catch (err) {
      setLoadError(`Couldn't update ${shipment.reference_number}: ${err.message}`);
      load();
    }
  }

  async function handleOpenHistory(shipment) {
    setSelected(shipment); // show the panel immediately with what we have
    try {
      const full = await fetchShipment(shipment.id);
      setSelected(full);
    } catch (err) {
      setLoadError(`Couldn't load history: ${err.message}`);
    }
  }

  async function handleCreate(form) {
    setCreating(true);
    setCreateError(null);
    try {
      await createShipment(form);
      setCreateOpen(false);
      load();
      return true;
    } catch (err) {
      setCreateError(err.message);
      return false;
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen p-8" style={{ background: "var(--paper)" }}>
      <div
        className="flex mx-auto border"
        style={{
          height: "calc(100vh - 4rem)",
          maxWidth: 1400,
          background: "var(--panel)",
          borderColor: "var(--track)",
        }}
      >
        <HistoryRail shipment={selected} onClose={() => setSelected(null)} />

        <div className="flex-1 min-w-0 overflow-y-auto">
          <header className="px-10 pt-12 pb-8">
            <h1 style={{ font: "600 28px 'IBM Plex Sans', sans-serif", color: "var(--ink)" }}>
              Shipments
            </h1>
            <p className="text-sm mt-2" style={{ color: "var(--ink-soft)" }}>
              Every line is a shipment. Position on the track is its status.
            </p>
          </header>

          <SearchFilterBar
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
            onCreate={() => setCreateOpen(true)}
          />

          {loadError && (
            <div className="px-10 py-4 text-sm" style={{ color: "var(--exception)" }}>
              {loadError}
            </div>
          )}

          {loading ? (
            <div className="px-10 py-20 text-sm text-center" style={{ color: "var(--ink-soft)" }}>
              Loading shipments…
            </div>
          ) : shipments.length === 0 ? (
            <div className="px-10 py-20 text-sm text-center" style={{ color: "var(--ink-soft)" }}>
              No shipments match. Try a different search, or create one.
            </div>
          ) : (
            <div>
              {shipments.map((s) => (
                <ShipmentRow
                  key={s.id}
                  shipment={s}
                  onOpenHistory={handleOpenHistory}
                  onAdvance={handleAdvance}
                />
              ))}
            </div>
          )}
        </div>

        <CreateShipmentPanel
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreate}
          submitting={creating}
          error={createError}
        />
      </div>
    </div>
  );
}