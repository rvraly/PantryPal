import { useState } from "react";
import CookingEntryForm from "./CookingEntryForm.jsx";

export default function RecipeCookLog({ recipe, onSave }) {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(null);
  const [occasion, setOccasion] = useState(0);

  function save(values) {
    const result = onSave(recipe, values);
    if (result.ok) {
      setSaved(result);
      setEditing(false);
    }
    return result;
  }

  return (
    <section className="recipe-cook-log" aria-label="Log this dish">
      <span className="eyebrow">FROM RECIPE TO MEMORY</span>
      <h3>Made this dish?</h3>
      <p>Keep a little note for your next lutong-bahay moment.</p>
      {saved && <div className="journal-success" role="status">
        <strong>Nailuto mo! Saved to My Cooking Journal.</strong>
        {saved.firstDish && <p>✧ First Lutong Bahay badge unlocked. Your first dish deserves a little celebration!</p>}
      </div>}
      {editing ? <CookingEntryForm key={occasion} onSave={save} onCancel={() => setEditing(false)} /> :
        <button type="button" className="primary-button" onClick={() => {
          setSaved(null);
          setOccasion((value) => value + 1);
          setEditing(true);
        }}>{saved ? "Log another cooking occasion" : "Nailuto ko!"}</button>}
    </section>
  );
}
