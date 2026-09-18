const BASE_URL = "http://localhost:3000/shipments";

async function handle(res) {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.message || body.error || message;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(message);
  }
  return res.status === 204 ? null : res.json();
}

export async function fetchShipments({ search = "", status = "" } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  const qs = params.toString();
  const res = await fetch(qs ? `${BASE_URL}?${qs}` : BASE_URL);
  return handle(res);
}

export async function createShipment(payload) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function updateShipmentStatus(id, status, note = "") {
  const res = await fetch(`${BASE_URL}/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, notes: note }),
  });
  return handle(res);
}

export async function fetchShipment(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  return handle(res);
}