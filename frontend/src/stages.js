// The main line every shipment travels. "Customs Hold" is deliberately not
// part of this line — it's an exception spur, not a normal stop, so it's
// handled separately in TrackLine.
export const MAIN_STAGES = [
  "Booked",
  "In Transit",
  "Delivered",
  "Cancelled",
];

export const EXCEPTION_STAGE = "Customs Hold";

export const ALL_STATUSES = [...MAIN_STAGES, EXCEPTION_STAGE];

export function mainIndex(status) {
  // Customs Hold branches off after "In Transit", so treat it as sitting
  // at that point on the main line for positioning purposes.
  if (status === EXCEPTION_STAGE) return MAIN_STAGES.indexOf("In Transit");
  return MAIN_STAGES.indexOf(status);
}

export function isException(status) {
  return status === EXCEPTION_STAGE;
}

export function nextStatus(status) {
  if (status === EXCEPTION_STAGE) return "Out for Delivery";
  const idx = MAIN_STAGES.indexOf(status);
  if (idx === -1 || idx === MAIN_STAGES.length - 1) return null;
  return MAIN_STAGES[idx + 1];
}