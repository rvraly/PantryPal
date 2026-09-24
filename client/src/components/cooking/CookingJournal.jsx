import { useState } from "react";
import { formatCookedDate } from "../../services/cookingJournal.js";
import CookingEntryForm from "./CookingEntryForm.jsx";

function JournalCard({ entry, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  return (
    <article className="journal-card">
      <div className="journal-card-top">
        <span className="category-tag">{entry.category || "Home cooking"}</span>
        <time dateTime={entry.cookedOn}>{formatCookedDate(entry.cookedOn)}</time>
      </div>
      <h3>{entry.recipeName}</h3>
      {editing ? <CookingEntryForm initialEntry={entry} onCancel={() => setEditing(false)}
        onSave={(values) => {
          const result = onUpdate(entry.id, values);
          if (result.ok) { setEditing(false); setMessage("Changes saved."); }
          return result;
        }} /> : <>
        <p className="journal-notes">{entry.notes || "No notes yet. Add what made this dish yours."}</p>
        <div className="cooking-actions">
          <button type="button" className="text-button" onClick={() => {
            setEditing(true); setConfirmDelete(false); setMessage(""); setError("");
          }} aria-label={`Edit journal entry for ${entry.recipeName}`}>Edit entry</button>
          <button type="button" className="text-button" onClick={() => {
            setConfirmDelete(true); setMessage(""); setError("");
          }} aria-label={`Delete journal entry for ${entry.recipeName}`}>Delete entry</button>
        </div>
      </>}
      {confirmDelete && <div className="journal-delete-confirm">
        <p>Delete this cooking memory? This cannot be undone.</p>
        <div className="cooking-actions">
          <button type="button" className="journal-secondary" onClick={() => {
            const result = onDelete(entry.id);
            if (!result.ok) setError(result.error);
          }}>Yes, delete</button>
          <button type="button" className="text-button" onClick={() => setConfirmDelete(false)}>Keep entry</button>
        </div>
      </div>}
      {message && <p className="journal-help" role="status">{message}</p>}
      {error && <p className="journal-error" role="alert">{error}</p>}
    </article>
  );
}

export default function CookingJournal({ journal }) {
  const [visibleCount, setVisibleCount] = useState(6);
  const [message, setMessage] = useState("");
  const entries = [...journal.entries].sort((a, b) =>
    b.cookedOn.localeCompare(a.cookedOn) || b.createdAt.localeCompare(a.createdAt));
  const unlocked = entries.length > 0;
  const uniqueDishes = new Set(entries.map((entry) => String(entry.recipeId))).size;

  return (
    <section className="cooking-journal" id="journal" aria-labelledby="journal-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">A LITTLE MORE SARAP TO REMEMBER</span>
          <h2 id="journal-title">My Cooking Journal</h2>
        </div>
        <span className="journal-count">{entries.length} {entries.length === 1 ? "memory" : "memories"}</span>
      </div>
      <p className="journal-description">Your dishes, your little discoveries, your next-time notes.</p>
      <p className="journal-help journal-storage-note">Saved only in this browser on this device. Clearing site data removes your journal; private browsing may erase it when you close the session.</p>
      {journal.error && <div className="journal-error" role="alert">
        <p>{journal.error}</p>
        <button type="button" className="journal-secondary" onClick={journal.refresh}>Reload journal</button>
      </div>}
      <div className={`cooking-badge ${unlocked ? "is-unlocked" : "is-locked"}`}>
        <span className="badge-symbol" aria-hidden="true">{unlocked ? "✧" : "○"}</span>
        <div>
          <strong>First Lutong Bahay</strong>
          <p>{unlocked ? `Unlocked! ${uniqueDishes} ${uniqueDishes === 1 ? "dish" : "dishes"} in your cooking story.` : "Save your first cooked dish to unlock this badge."}</p>
        </div>
        <span className="badge-status">{unlocked ? "UNLOCKED" : "LOCKED"}</span>
      </div>
      <p className="journal-help" role="status">{message}</p>
      {!entries.length ? <div className="journal-empty">
        <h3>Your first cooking memory starts here.</h3>
        <p>Open a recipe and tap “Nailuto ko!” after cooking. Add a date and a note, then save it here.</p>
        <a className="journal-secondary" href="#finder">Find something to cook ↑</a>
      </div> : <>
        <div className="journal-grid">
          {entries.slice(0, visibleCount).map((entry) => <JournalCard key={entry.id} entry={entry}
            onUpdate={journal.updateEntry} onDelete={(id) => {
              const result = journal.deleteEntry(id);
              if (result.ok) setMessage("Cooking memory deleted.");
              return result;
            }} />)}
        </div>
        {visibleCount < entries.length && <button type="button" className="load-more"
          onClick={() => setVisibleCount((count) => count + 6)}>Show more memories</button>}
      </>}
    </section>
  );
}
