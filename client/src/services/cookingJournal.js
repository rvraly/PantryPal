// Browser-only journal: recipes still come through the existing API.
export const JOURNAL_KEY = "pantrypal.cooking-journal.v1";
export const MAX_NOTES = 2000;

export function localToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function formatCookedDate(value) {
  // Local noon avoids shifting the displayed calendar day across time zones.
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });
}

export function newEntryId() {
  return globalThis.crypto?.randomUUID?.() ??
    `cook-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function validEntry(entry) {
  return entry && typeof entry === "object" &&
    typeof entry.id === "string" && entry.id.length > 0 &&
    (typeof entry.recipeId === "string" || Number.isFinite(entry.recipeId)) &&
    typeof entry.recipeName === "string" && entry.recipeName.trim().length > 0 &&
    typeof entry.category === "string" && validDate(entry.cookedOn) &&
    typeof entry.notes === "string" && entry.notes.length <= MAX_NOTES &&
    typeof entry.createdAt === "string" && Number.isFinite(Date.parse(entry.createdAt)) &&
    typeof entry.updatedAt === "string" && Number.isFinite(Date.parse(entry.updatedAt));
}

export function readJournal(storage) {
  const raw = storage.getItem(JOURNAL_KEY);
  if (raw === null) return [];
  const data = JSON.parse(raw);
  if (!data || data.version !== 1 || !Array.isArray(data.entries) ||
      !data.entries.every(validEntry) ||
      new Set(data.entries.map((entry) => entry.id)).size !== data.entries.length) {
    throw new Error("Invalid journal data");
  }
  return data.entries;
}

export function writeJournal(storage, entries) {
  if (!entries.every(validEntry)) throw new Error("Invalid journal entry");
  storage.setItem(JOURNAL_KEY, JSON.stringify({ version: 1, entries }));
}

export function validateCookingEntry({ cookedOn, notes }) {
  if (!validDate(cookedOn) || cookedOn > localToday()) {
    return "Choose a valid date, today or earlier.";
  }
  if (typeof notes !== "string" || notes.length > MAX_NOTES) {
    return `Keep your notes within ${MAX_NOTES} characters.`;
  }
  return "";
}

export function chooseChallenge(results, selected, previousId, random = Math.random) {
  if (!selected.length) return null;
  const eligible = results.filter((result) => result.total > 0 && result.missing.length === 0);
  const alternatives = eligible.filter(({ recipe }) => String(recipe.id) !== String(previousId));
  const pool = alternatives.length ? alternatives : eligible;
  return pool.length ? pool[Math.floor(random() * pool.length)].recipe : null;
}
