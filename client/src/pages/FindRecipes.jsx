import { useEffect, useMemo, useRef, useState } from "react";
import {
  ingredientSuggestions,
  normalizeName,
  rankRecipes,
} from "../services/recipeMatching";

import { listRecipes, listIngredients } from "../api";
import DemoNotice from "../components/DemoNotice.jsx";
import ChallengePanel from "../components/cooking/ChallengePanel.jsx";
import CookingJournal from "../components/cooking/CookingJournal.jsx";
import RecipeCookLog from "../components/cooking/RecipeCookLog.jsx";
import useCookingJournal from "../hooks/useCookingJournal.js";
import "../cooking.css";

const QUICK_PICKS = [
  ["chicken", "Manok"],
  ["egg", "Itlog"],
  ["garlic", "Bawang"],
  ["onion", "Sibuyas"],
  ["tomato", "Kamatis"],
  ["rice", "Bigas"],
];
const BASICS = ["salt", "black pepper", "vegetable oil", "water"];
const titleCase = (value) =>
  value.replace(/\b\w/g, (letter) => letter.toUpperCase());
const displayName = (recipe) => recipe.filipino_name || recipe.name;

function RecipeDialog({ recipe, selected, onDismiss, onSaveCooked }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);
  return (
    <dialog
      ref={dialogRef}
      className="recipe-dialog"
      onClose={() => {
        if (!dialogRef.current?.open) onDismiss();
      }}
      aria-labelledby="recipe-title"
    >
      <div className="dialog-top">
        <span className="eyebrow">LET’S GET COOKING</span>
        <button
          type="button"
          className="close-button"
          onClick={() => dialogRef.current.close()}
          aria-label="Close recipe"
        >
          ×
        </button>
      </div>
      <h2 id="recipe-title">{displayName(recipe)}</h2>
      {recipe.filipino_name && <p className="muted">{recipe.name}</p>}
      <div className="recipe-facts">
        <span>Prep: {recipe.prep_time_text}</span>
        {recipe.cook_time_text && <span>Cook: {recipe.cook_time_text}</span>}
        <span>
          {titleCase(recipe.yield_type)}: {recipe.yield_text}
        </span>
      </div>
      <h3>Ingredients</h3>
      <ul className="detail-ingredients">
        {recipe.ingredients.map((item, index) => (
          <li key={index}>
            {item.section &&
              item.section !== recipe.ingredients[index - 1]?.section && (
                <h4>{titleCase(item.section.toLowerCase())}</h4>
              )}
            <span
              className={
                selected.length &&
                item.match_options.some((name) => selected.includes(name))
                  ? "ingredient-available"
                  : ""
              }
            >
              {selected.length > 0 &&
                item.match_options.some((name) => selected.includes(name)) && (
                  <span aria-label="Selected ingredient">✓ </span>
                )}
              {item.source_text}
            </span>
          </li>
        ))}
      </ul>
      <h3>How to make it</h3>
      <ol className="method">
        {recipe.instructions.map((step, index) => (
          <li key={step.step}>
            {step.section &&
              step.section !== recipe.instructions[index - 1]?.section && (
                <h4>{titleCase(step.section.toLowerCase())}</h4>
              )}
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
      {recipe.source_tips.length > 0 && (
        <details>
          <summary>Cooking tips from the cookbook</summary>
          {recipe.source_tips.map((tip, index) => (
            <p key={index}>{tip}</p>
          ))}
        </details>
      )}
      <p className="source-note">
        Source: {recipe.source.title}, pp.{" "}
        {recipe.source.printed_pages.join("–")}.
      </p>
      <RecipeCookLog recipe={recipe} onSave={onSaveCooked} />
    </dialog>
  );
}

export default function FindRecipes() {
  const journal = useCookingJournal();
  const [recipes, setRecipes] = useState([]);
  const [vocabulary, setVocabulary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [slow, setSlow] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [category, setCategory] = useState("All recipes");
  const [visibleCount, setVisibleCount] = useState(9);
  const [openedRecipe, setOpenedRecipe] = useState(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError("");
    setSlow(false);
    const slowTimer = setTimeout(() => setSlow(true), 3000);

    async function load() {
      try {
        const [recipeRows, ingredientRows] = await Promise.all([
          listRecipes({ signal: controller.signal }),
          listIngredients({ signal: controller.signal }),
        ]);
        if (!controller.signal.aborted) {
          setRecipes(recipeRows);
          setVocabulary(ingredientRows);
        }
      } catch (error) {
        if (error.name !== "AbortError" && !controller.signal.aborted) {
          setLoadError("We couldn’t load the recipes. Please try again.");
        }
      } finally {
        clearTimeout(slowTimer);
        if (!controller.signal.aborted) {
          setLoading(false);
          setSlow(false);
        }
      }
    }
    load();
    return () => {
      controller.abort();
      clearTimeout(slowTimer);
    };
  }, [attempt]);

  const suggestions = useMemo(
    () => ingredientSuggestions(vocabulary, query, selected),
    [vocabulary, query, selected],
  );
  const results = useMemo(
    () => rankRecipes(recipes, selected, category),
    [recipes, selected, category],
  );
  const categories = useMemo(
    () => ["All recipes", ...new Set(recipes.map((recipe) => recipe.category))],
    [recipes],
  );
  const readyCount = selected.length
    ? results.filter((result) => result.missing.length === 0).length
    : 0;

  function addIngredient(name) {
    setSelected((current) =>
      current.includes(name) ? current : [...current, name],
    );
    setQuery("");
    setInputMessage("");
    setVisibleCount(9);
  }
  function handleAdd(event) {
    event.preventDefault();
    const ingredient = vocabulary.find((item) =>
      [item.name, ...item.aliases].some(
        (alias) => normalizeName(alias) === normalizeName(query),
      ),
    );
    if (ingredient) addIngredient(ingredient.name);
    else
      setInputMessage(
        "Choose an ingredient below, or try its English or Filipino name.",
      );
  }
  function removeIngredient(name) {
    setSelected((current) => current.filter((item) => item !== name));
    setVisibleCount(9);
  }
  function surpriseMe() {
    const complete = results.filter((result) => result.missing.length === 0);
    const pool = complete.length ? complete : results.slice(0, 10);
    if (pool.length)
      setOpenedRecipe(pool[Math.floor(Math.random() * pool.length)].recipe);
  }

  return (
    <div className="pantrypal-app">
      <header className="site-header">
        <div className="header-inner">
          <a href="#top" className="brand" aria-label="PantryPal home">
            <span className="brand-icon" aria-hidden="true">
              ♧
            </span>{" "}
            Pantry<span>Pal</span>
          </a>
          <nav className="pantry-nav" aria-label="Main navigation">
            <a className="header-link" href="#finder">
              Find recipes
            </a>
            <a className="header-link journal-nav-link" href="#journal">
              My journal
            </a>
          </nav>
        </div>
      </header>
      <main id="top">
        <section className="hero" aria-labelledby="page-title">
          <span className="eyebrow">
            A LITTLE PANTRY. PLENTY OF POSSIBILITIES.
          </span>
          <h1 id="page-title">
            Anong meron
            <br />
            sa <em>kusina mo?</em>
          </h1>
          <p>
            Good food starts with what you have. Turn your everyday
            <br className="desktop-break" /> ingredients into something proudly
            Pinoy.
          </p>
          <div className="hero-foot">
            <span className="small-dot" /> Filipino favorites, made with what’s
            on hand.
          </div>
        </section>

        <DemoNotice />

        {loading ? (
          <div className="status-box" role="status">
            {slow
              ? "The server may be waking up. This can take up to a minute…"
              : "Opening the recipe collection…"}
          </div>
        ) : loadError ? (
          <div className="status-box" role="alert">
            <p>{loadError}</p>
            <button
              className="primary-button"
              onClick={() => setAttempt((value) => value + 1)}
            >
              Try again
            </button>
          </div>
        ) : recipes.length === 0 ? (
          <div className="status-box" role="status">
            <h2>No recipes yet.</h2>
            <p>The recipe collection is empty. Please check back later.</p>
          </div>
        ) : (
          <>
            <section
              className="finder-panel"
              id="finder"
              aria-labelledby="finder-title"
            >
              <div className="section-heading">
                <div>
                  <span className="eyebrow">START WITH YOUR INGREDIENTS</span>
                  <h2 id="finder-title">What’s in your kitchen?</h2>
                </div>
                <span className="step-marker">01 / SELECT</span>
              </div>
              <p className="muted">
                Add ingredients in English or Filipino. We’ll find the
                possibilities.
              </p>
              <form onSubmit={handleAdd} className="ingredient-form">
                <label className="sr-only" htmlFor="ingredient-search">
                  Search for an ingredient
                </label>
                <span className="search-mark" aria-hidden="true">
                  ⌕
                </span>
                <input
                  id="ingredient-search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setInputMessage("");
                  }}
                  placeholder="Try chicken, itlog, or bawang…"
                  autoComplete="off"
                  aria-describedby="ingredient-help"
                />
                <button
                  type="submit"
                  className="add-button"
                  disabled={!query.trim()}
                >
                  Add +
                </button>
              </form>
              <p id="ingredient-help" className="input-help" role="status">
                {inputMessage ||
                  (query.trim() && suggestions.length === 0
                    ? "No new ingredients found. Try another name."
                    : "Select a suggestion, or type a full ingredient name and press Enter.")}
              </p>
              {query.trim() ? (
                <div
                  className="suggestion-list"
                  aria-label="Ingredient suggestions"
                >
                  {suggestions.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => addIngredient(item.name)}
                    >
                      {titleCase(item.name)} <span>+</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="quick-picks">
                  <span className="tiny-label">COMMON PICKS</span>
                  {QUICK_PICKS.filter(([name]) => !selected.includes(name)).map(
                    ([name, label]) => (
                      <button
                        className="chip"
                        key={name}
                        onClick={() => addIngredient(name)}
                      >
                        + {label}
                      </button>
                    ),
                  )}
                </div>
              )}
              <div className="selected-area">
                <div className="selected-heading">
                  <span className="tiny-label">
                    YOUR INGREDIENTS <b>{selected.length}</b>
                  </span>
                  {selected.length > 0 && (
                    <button
                      className="text-button"
                      onClick={() => {
                        setSelected([]);
                        setVisibleCount(9);
                      }}
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="selected-chips">
                  {selected.length ? (
                    selected.map((name) => (
                      <button
                        className="chip selected"
                        key={name}
                        onClick={() => removeIngredient(name)}
                        aria-label={`Remove ${name}`}
                      >
                        {titleCase(name)} <span aria-hidden="true">×</span>
                      </button>
                    ))
                  ) : (
                    <p className="empty-pantry">
                      Your pantry starts here. Add a few ingredients above.
                    </p>
                  )}
                </div>
              </div>
              <fieldset className="basics">
                <legend>Have the basics? Select what you have.</legend>
                {BASICS.map((name) => (
                  <label key={name}>
                    <input
                      type="checkbox"
                      checked={selected.includes(name)}
                      onChange={(event) =>
                        event.target.checked
                          ? addIngredient(name)
                          : removeIngredient(name)
                      }
                    />
                    {titleCase(name)}
                  </label>
                ))}
              </fieldset>
              <div className="finder-footer">
                <span>Small ingredients. Big lutong-bahay energy.</span>
                <button
                  className="primary-button"
                  onClick={() =>
                    resultsRef.current?.scrollIntoView({
                      behavior: window.matchMedia(
                        "(prefers-reduced-motion: reduce)",
                      ).matches
                        ? "auto"
                        : "smooth",
                      block: "start",
                    })
                  }
                >
                  Find recipes <span aria-hidden="true">→</span>
                </button>
              </div>
            </section>

            <ChallengePanel
              results={results}
              selected={selected}
              category={category}
              onOpen={setOpenedRecipe}
            />

            <section
              className="results"
              ref={resultsRef}
              id="results"
              aria-labelledby="results-title"
            >
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    YOUR NEXT HOME-COOKED FAVORITE
                  </span>
                  <h2 id="results-title">
                    {selected.length
                      ? "Here’s what’s cooking."
                      : "A little inspiration."}
                  </h2>
                </div>
                <button
                  className="surprise-button"
                  disabled={!selected.length || !results.length}
                  onClick={surpriseMe}
                >
                  ✧ Surprise me!
                </button>
              </div>
              <p className="muted" role="status">
                {selected.length
                  ? `${results.length} matching recipes · ${readyCount} with all required ingredient names selected`
                  : `Explore ${recipes.length} Filipino recipes. Add ingredients to see your matches.`}
              </p>
              <p className="match-note">
                Matches check ingredient names, not amounts or cuts. Garnishes
                and serving extras are listed in each recipe.
              </p>
              <label className="category-control">
                Category{" "}
                <select
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value);
                    setVisibleCount(9);
                  }}
                >
                  {categories.map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
              </label>
              {results.length === 0 ? (
                <div className="status-box">
                  <h3>No matches just yet.</h3>
                  <p>
                    Try adding more ingredients or choosing another category.
                  </p>
                </div>
              ) : (
                <div className="recipe-grid">
                  {results
                    .slice(0, visibleCount)
                    .map(({ recipe, missing, matched, total }) => (
                      <article className="recipe-card" key={recipe.id}>
                        <div className="card-top">
                          <span className="category-tag">
                            {recipe.category}
                          </span>
                          <span className="card-number">
                            {String(recipe.id).padStart(2, "0")}
                          </span>
                        </div>
                        <h3>{displayName(recipe)}</h3>
                        <p className="recipe-subtitle">
                          {recipe.filipino_name
                            ? recipe.name
                            : `${total} required ingredient groups`}
                        </p>
                        <div className="card-meta">
                          <span>
                            Cook: {recipe.cook_time_text || "Not listed"}
                          </span>
                          <span>
                            {titleCase(recipe.yield_type)}: {recipe.yield_text}
                          </span>
                        </div>
                        {recipe.additional_time_text && (
                          <p className="waiting-note">
                            Also allow {recipe.additional_time_text}.
                          </p>
                        )}
                        {selected.length > 0 && (
                          <div className="match-summary">
                            <span
                              className={
                                missing.length
                                  ? "match-badge partial"
                                  : "match-badge"
                              }
                            >
                              {missing.length
                                ? `Kulang ng ${missing.length}`
                                : "All ingredient names selected"}
                            </span>
                            <span className="match-count">
                              {matched}/{total} matched
                            </span>
                            <p>
                              {missing.length
                                ? `Missing: ${missing
                                    .slice(0, 3)
                                    .map((options) => options.join(" or "))
                                    .join(
                                      ", ",
                                    )}${missing.length > 3 ? ` + ${missing.length - 3} more` : ""}`
                                : "Check the recipe for quantities and preparation."}
                            </p>
                          </div>
                        )}
                        <button
                          className="recipe-button"
                          onClick={() => setOpenedRecipe(recipe)}
                          aria-label={`View recipe for ${displayName(recipe)}`}
                        >
                          View recipe <span aria-hidden="true">↗</span>
                        </button>
                      </article>
                    ))}
                </div>
              )}
              {visibleCount < results.length && (
                <button
                  className="load-more"
                  onClick={() => setVisibleCount((count) => count + 9)}
                >
                  Show more recipes
                </button>
              )}
            </section>
          </>
        )}
        <CookingJournal journal={journal} />
      </main>
      <footer className="site-footer">
        <span className="brand">
          Pantry<span>Pal</span>
        </span>
        <p>A little less waste. A little more sarap.</p>
        <span>MADE FOR EVERYDAY COOKING</span>
      </footer>
      {openedRecipe && (
        <RecipeDialog
          key={openedRecipe.id}
          recipe={openedRecipe}
          selected={selected}
          onSaveCooked={journal.addEntry}
          onDismiss={() => setOpenedRecipe(null)}
        />
      )}
    </div>
  );
}
