// The main line every shipment travels. "Customs Hold" is deliberately not
// part of this line — it's an exception spur, not a normal stop, so it's
// handled separately in TrackLine.
export const MAIN_STAGES = [
  "Booked",
  "In Transit",
  "Delivered",
];

export const EXCEPTION_STAGES = ["Customs Hold", "Cancelled"];

export const ALL_STATUSES = [...MAIN_STAGES, ...EXCEPTION_STAGES];

export function mainIndex(status) {
  // Customs Hold branches off after "In Transit"
  if (status === "Customs Hold") return MAIN_STAGES.indexOf("In Transit");
  // Cancelled could branch off anywhere, but let's position it at Booked or In Transit
  if (status === "Cancelled") return MAIN_STAGES.indexOf("Booked"); 
  return MAIN_STAGES.indexOf(status);
}

export function isException(status) {
  return EXCEPTION_STAGES.includes(status);
}

export function nextStatus(status) {
  if (status === "Customs Hold") return "Out for Delivery";
  if (status === "Cancelled") return null; // No next status after cancelled
  const idx = MAIN_STAGES.indexOf(status);
  if (idx === -1 || idx === MAIN_STAGES.length - 1) return null;
  return MAIN_STAGES[idx + 1];
}