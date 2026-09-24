import { useId, useState } from "react";
import { localToday, MAX_NOTES, newEntryId } from "../../services/cookingJournal.js";

export default function CookingEntryForm({ initialEntry, onSave, onCancel }) {
  const formId = useId();
  const [entryId] = useState(() => initialEntry?.id || newEntryId());
  const [cookedOn, setCookedOn] = useState(() => initialEntry?.cookedOn || localToday());
  const [notes, setNotes] = useState(initialEntry?.notes || "");
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    const result = onSave({ id: entryId, cookedOn, notes });
    if (!result.ok) setError(result.error);
  }

  return (
    <form className="cooking-entry-form" onSubmit={submit}>
      <div className="journal-field">
        <label htmlFor={`${formId}-date`}>Date cooked</label>
        <input id={`${formId}-date`} type="date" required max={localToday()}
          value={cookedOn} onChange={(event) => setCookedOn(event.target.value)} />
      </div>
      <div className="journal-field">
        <label htmlFor={`${formId}-notes`}>Personal notes <span>(optional)</span></label>
        <textarea id={`${formId}-notes`} rows={4} maxLength={MAX_NOTES}
          value={notes} onChange={(event) => setNotes(event.target.value)}
          placeholder="How did it turn out? What would you change next time?"
          aria-describedby={`${formId}-count`} />
        <span className="journal-help" id={`${formId}-count`}>{notes.length}/{MAX_NOTES} characters</span>
      </div>
      {error && <p className="journal-error" role="alert">{error}</p>}
      <div className="cooking-actions">
        <button type="submit" className="primary-button">
          {initialEntry ? "Save changes" : "Save to my journal"}
        </button>
        <button type="button" className="journal-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
