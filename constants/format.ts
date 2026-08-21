// Backend units are shouty enum-like strings ("PACK", "BOTTLE") — title-case
// them for display without needing a translation table.
export const formatUnit = (unit: string) =>
  unit.charAt(0).toUpperCase() + unit.slice(1).toLowerCase();
