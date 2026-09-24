import { useCallback, useEffect, useState } from "react";
import {
  JOURNAL_KEY, readJournal, writeJournal, validateCookingEntry,
} from "../services/cookingJournal.js";

const LOAD_ERROR = "Your cooking journal could not be read. Check browser storage permissions and try again. Existing saved data has not been replaced.";
const SAVE_ERROR = "Could not save this change. Browser storage may be full or blocked. Your previously saved journal has not been changed; keep a copy of your notes and try again.";

function load() {
  try {
    return { entries: readJournal(window.localStorage), error: "" };
  } catch {
    return { entries: [], error: LOAD_ERROR };
  }
}

export default function useCookingJournal() {
  const [state, setState] = useState(load);
  const refresh = useCallback(() => setState(load()), []);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === JOURNAL_KEY || event.key === null) refresh();
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  // Re-read before each deliberate write so an old tab does not normally
  // overwrite changes made in another tab. Never auto-save on mount.
  function commit(change) {
    let entries;
    let storage;
    try {
      storage = window.localStorage;
      entries = readJournal(storage);
    } catch {
      setState((current) => ({ ...current, error: LOAD_ERROR }));
      return { ok: false, error: LOAD_ERROR };
    }
    const result = change(entries);
    if (result.error) return { ok: false, error: result.error };
    try {
      writeJournal(storage, result.entries);
    } catch {
      setState((current) => ({ ...current, error: SAVE_ERROR }));
      return { ok: false, error: SAVE_ERROR };
    }
    setState({ entries: result.entries, error: "" });
    return { ok: true, firstDish: entries.length === 0 && result.entries.length > 0 };
  }

  function addEntry(recipe, values) {
    const error = validateCookingEntry(values);
    if (error) return { ok: false, error };
    return commit((entries) => {
      // Repeated submit of the same form is idempotent; another cooking
      // occasion uses a fresh form ID, even for the same dish and date.
      if (entries.some((entry) => entry.id === values.id)) return { entries };
      const now = new Date().toISOString();
      return { entries: [{
        id: values.id,
        recipeId: recipe.id,
        recipeName: recipe.filipino_name || recipe.name,
        category: recipe.category || "",
        cookedOn: values.cookedOn,
        notes: values.notes.trim(),
        createdAt: now,
        updatedAt: now,
      }, ...entries] };
    });
  }

  function updateEntry(id, values) {
    const error = validateCookingEntry(values);
    if (error) return { ok: false, error };
    return commit((entries) => {
      if (!entries.some((entry) => entry.id === id)) {
        return { error: "This entry was removed in another tab. Reload the journal before editing." };
      }
      return { entries: entries.map((entry) => entry.id === id ? {
        ...entry, cookedOn: values.cookedOn, notes: values.notes.trim(),
        updatedAt: new Date().toISOString(),
      } : entry) };
    });
  }

  function deleteEntry(id) {
    return commit((entries) => ({ entries: entries.filter((entry) => entry.id !== id) }));
  }

  return { ...state, addEntry, updateEntry, deleteEntry, refresh };
}
