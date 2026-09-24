import { useState } from "react";
import { chooseChallenge } from "../../services/cookingJournal.js";

export default function ChallengePanel({ results, selected, category, onOpen }) {
  const [picked, setPicked] = useState(null);
  const eligible = selected.length
    ? results.filter((result) => result.total > 0 && result.missing.length === 0) : [];
  // If ingredients or category change, a stale challenge must not claim
  // that the user still has all required ingredients.
  const active = eligible.find(({ recipe }) => recipe.id === picked?.id)?.recipe;

  return (
    <section className="challenge-panel" aria-labelledby="challenge-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">A LITTLE KITCHEN ADVENTURE</span>
          <h2 id="challenge-title">Lutong Bahay Challenge</h2>
        </div>
        <span className="challenge-symbol" aria-hidden="true">✧</span>
      </div>
      <p className="challenge-description">Let your pantry choose today’s cooking adventure.</p>
      <div className="challenge-controls">
        <button type="button" className="primary-button" disabled={!eligible.length}
          aria-describedby="challenge-help" onClick={() => {
            setPicked(chooseChallenge(results, selected, picked?.id));
          }}>{active ? "Pick another challenge" : "Challenge me!"}</button>
        <p id="challenge-help" className="journal-help">
          {!selected.length ? "Add your ingredients above to unlock a challenge." :
            !eligible.length ? "No complete matches in this category yet. Add more ingredients or choose All recipes." :
              `${eligible.length} eligible ${eligible.length === 1 ? "recipe" : "recipes"} · ${category}`}
        </p>
      </div>
      <div aria-live="polite" aria-atomic="true">
        {active ? <div className="challenge-reveal">
          <span className="tiny-label">YOUR KITCHEN CHALLENGE</span>
          <h3>{active.filipino_name || active.name}</h3>
          <p>All required ingredient names are selected. Check quantities, cuts and preparation before cooking.</p>
          <button type="button" className="journal-secondary" onClick={() => onOpen(active)}>Open challenge recipe →</button>
        </div> : picked ? <p className="journal-help challenge-changed">Your pantry or category changed. Pick a new challenge when a complete match is available.</p> : null}
      </div>
      <p className="challenge-footnote">Cook it, then tap “Nailuto ko!” in the recipe to remember how it went.</p>
    </section>
  );
}
