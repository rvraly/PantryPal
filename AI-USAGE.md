# AI Usage

PantryPal was developed with substantial assistance from ChatGPT by OpenAI. I used AI for planning, code suggestions, debugging, documentation, and explanations. I manually reviewed, tested, and modified the generated work instead of accepting every response unchanged.

This repository existed before the class template included an `AI-USAGE.md` file, so I created this file manually. The earlier entries below were reconstructed using my project notes, conversations, and Git commit history.

## 1. How I used AI

### Entry 1: Planning and adapting the template

- **Date:** September 17–24, 2026
- **Tool:** ChatGPT by OpenAI
- **What I asked:** I asked how to replace the HAUnted Sightings template with PantryPal while keeping the required React, Express, and PostgreSQL structure.
- **What AI provided:** It explained how to replace the sightings-related interface, API functions, repository queries, database schema, and sample data with recipe-related versions.
- **What I kept and changed:** I kept the required separation between the React client, Express API, and PostgreSQL database. I changed the project purpose, content, labels, visual design, and features to focus on Filipino recipes and ingredient matching.
- **Commit:** [Implement PantryPal recipe finder and update documentation](https://github.com/rvraly/PantryPal/commit/f899c68)

### Entry 2: Connecting Express to Supabase PostgreSQL

- **Date:** September 17–24, 2026
- **Tool:** ChatGPT by OpenAI
- **What I asked:** I asked for help connecting the Express backend to my Supabase PostgreSQL database and fixing errors involving the `.env` file and database certificate.
- **What AI provided:** It provided configuration suggestions for `DATABASE_URL`, the PostgreSQL connection pool, SSL certificate verification, CORS, and the `/readyz` database check.
- **What I kept and changed:** I kept the environment-variable approach and verified the connection using the database health endpoint. I corrected the file locations, used the Supabase Session Pooler connection string, and kept certificate verification enabled. I confirmed that the API could read 100 recipes and 193 ingredients.
- **Commit:** [Implement PantryPal recipe finder and update documentation](https://github.com/rvraly/PantryPal/commit/f899c68)

### Entry 3: Building the recipe finder

- **Date:** September 17–24, 2026
- **Tool:** ChatGPT by OpenAI
- **What I asked:** I asked for help building an ingredient-based recipe finder with suggestions, filters, match counts, recipe cards, and a recipe-details dialog.
- **What AI provided:** It produced React and JavaScript suggestions for ingredient selection, recipe ranking, category filtering, loading states, and displaying recipe details.
- **What I kept and changed:** I kept the general matching structure but manually changed text, Filipino labels, visual wording, colors, spacing, card sizes, and parts of the interaction. I tested the ingredient-selection flow and changed interface behavior when it did not feel right.
- **Commit:** [Implement PantryPal recipe finder and update documentation](https://github.com/rvraly/PantryPal/commit/f899c68)

### Entry 4: Adding the Lutong Bahay Challenge and Cooking Journal

- **Date:** September 24, 2026
- **Tool:** ChatGPT by OpenAI
- **What I asked:** I asked for help adding a fun and unique feature that would encourage users to cook recipes instead of only viewing them.
- **What AI provided:** It suggested and helped implement the Lutong Bahay Challenge, the “Nailuto ko!” action, My Cooking Journal, personal notes, cooking dates, and the First Lutong Bahay badge.
- **What I kept and changed:** I kept the challenge and journal concept. I chose not to add accounts, so journal entries use browser local storage. I manually reviewed the interface, changed wording, adjusted styling, and tested whether entries remained after refreshing.
- **Commit:** [Add Lutong Bahay challenge and cooking journal](https://github.com/rvraly/PantryPal/commit/b60d873)

### Entry 5: Improving the journal storage message

- **Date:** September 24, 2026
- **Tool:** ChatGPT by OpenAI
- **What I asked:** I asked for help changing the message that explained how Cooking Journal entries were stored.
- **What AI provided:** It suggested clearer wording explaining that entries remain after refreshing but are limited to the current browser and device.
- **What I kept and changed:** I manually edited the final message so it was shorter and easier for users to understand. I kept the limitation documented as a possible future improvement instead of adding user accounts.
- **Commit:** [Revise journal storage help text](https://github.com/rvraly/PantryPal/commit/f352f9d)

### Entry 6: Documentation and security review

- **Date:** September 26, 2026
- **Tool:** ChatGPT by OpenAI
- **What I asked:** I asked for help updating the README, setup instructions, features, known issues, weekly report, reflection journal, and security checklist.
- **What AI provided:** It organized the documentation and suggested checks for ignored `.env` files, Git history, exposed credentials, Supabase security, GitHub Actions, licences, and deployment status.
- **What I kept and changed:** I verified commands against my actual project, removed template information that no longer applied, corrected references to Python, and clearly stated that the public frontend still used demo data while the Express API was not publicly deployed.
- **Commits:** [Revise README for clarity and additional features](https://github.com/rvraly/PantryPal/commit/215fd75) and [Update Week 2 project documentation](https://github.com/rvraly/PantryPal/commit/cd002db)

### Entry 7: Git, branding integration, and deployment troubleshooting

- **Date:** September 27, 2026
- **Tool:** ChatGPT by OpenAI
- **What I asked:** I asked for help correcting my Git email history, resolving a rebase conflict, adding my logo and favicon, and pushing the updated project.
- **What AI provided:** It explained interactive rebase, amending commit authors, stashing changes, resolving the Cooking Journal conflict, and adding an image from the Vite `public` folder.
- **What I kept and changed:** I followed the Git steps carefully but made the final branding decisions myself. I designed and edited the PantryPal logo myself; AI was only used to explain how to integrate the finished asset into the application.
- **Commit:** [Add PantryPal branding and update interface](https://github.com/rvraly/PantryPal/commit/39f96ae)

## 2. Where the AI got it wrong

### 1. It initially guided me toward Python and FastAPI

- **What AI gave me:** Early guidance used Python, FastAPI, Uvicorn, and a Supabase API key for the backend.
- **What was wrong:** My professor’s project template required a Node.js and Express backend. Following the Python approach created an incompatible project structure and made the setup more confusing.
- **What I did instead:** I returned to the required template, removed the Python backend, and rebuilt the API using Node.js, Express, `pg`, and PostgreSQL.
- **Commit:** [Implement PantryPal recipe finder and update documentation](https://github.com/rvraly/PantryPal/commit/f899c68)

### 2. The initial Supabase connection approach used the wrong credential

- **What AI gave me:** The early backend approach relied on a Supabase publishable or secret API key.
- **What was wrong:** The final Express implementation used the `pg` library and needed a PostgreSQL `DATABASE_URL`, not a frontend publishable key. The incorrect approach also caused confusion about which values belonged in the client and server environments.
- **What I did instead:** I used the Supabase Session Pooler PostgreSQL connection string in `server/.env`, kept it out of Git, and tested it using `/readyz`. I also used a trusted CA certificate instead of disabling SSL verification.
- **Commit:** [Implement PantryPal recipe finder and update documentation](https://github.com/rvraly/PantryPal/commit/f899c68)

### 3. The suggested full-logo placement looked poor in the header

- **What AI gave me:** AI suggested replacing the compact header brand with the complete logo image.
- **What was wrong:** The full image had too much empty space and became tall and awkward inside the navigation header. It did not match the compact layout of the existing design.
- **What I did instead:** I evaluated the result visually, changed the integration, adjusted the relevant JSX and CSS, and used my own edited branding asset. The logo itself was designed and edited by me, not generated by AI.
- **Commit:** [Add PantryPal branding and update interface](https://github.com/rvraly/PantryPal/commit/39f96ae)

## 3. Who wrote what

The files below may also contain AI-assisted code. The items listed here identify the specific parts I manually wrote, edited, or substantially changed myself.

### Code and assets I worked on myself

#### `client/src/pages/FindRecipes.jsx`

- **Commit:** [Implement PantryPal recipe finder and update documentation](https://github.com/rvraly/PantryPal/commit/f899c68)
- I manually changed the interface text and Filipino labels so the application matched PantryPal’s Filipino cooking theme. I also adjusted parts of the button and feature behavior after testing the page. These changes made the generated interface fit my intended user experience instead of leaving it as generic output.

#### `client/src/styles.css`

- **Commits:** [Implement PantryPal recipe finder and update documentation](https://github.com/rvraly/PantryPal/commit/f899c68) and [Add PantryPal branding and update interface](https://github.com/rvraly/PantryPal/commit/39f96ae)
- I manually adjusted colors, spacing, card sizes, and responsive styling. I tested the layout at desktop and mobile widths and changed values when cards, buttons, or branding did not look balanced. I used green, cream, and terracotta colors to keep the interface consistent with PantryPal’s visual identity.

#### `client/src/components/cooking/CookingJournal.jsx`

- **Commit:** [Revise journal storage help text](https://github.com/rvraly/PantryPal/commit/f352f9d)
- I manually revised the storage message shown in My Cooking Journal. It tells users that journal entries remain after refreshing but are stored only on the current device. I kept this limitation visible because the project currently has no accounts or cloud journal synchronization.

#### `client/index.html` and `client/src/pages/FindRecipes.jsx`

- **Commit:** [Add PantryPal branding and update interface](https://github.com/rvraly/PantryPal/commit/39f96ae)
- I added my PantryPal logo and favicon to the project and changed how the branding appeared in the interface. I used Vite’s base path when referencing the public asset so it could work both locally and through the `/PantryPal/` GitHub Pages path.

#### `client/public/pantrypal-logo.png`

- **Commit:** [Add PantryPal branding and update interface](https://github.com/rvraly/PantryPal/commit/39f96ae)
- I designed and edited the PantryPal logo myself. Its cooking imagery and green-and-terracotta colors were chosen to match the Filipino home-cooking concept and the existing interface.

### AI-assisted code I understand best

#### `client/src/services/recipeMatching.js`

- **Commit:** [Implement PantryPal recipe finder and update documentation](https://github.com/rvraly/PantryPal/commit/f899c68)
- This file contains the main client-side matching logic. `normalizeName` converts values to lowercase, removes surrounding spaces, and separates Unicode accents so ingredient names can be compared more consistently.
- `ingredientSuggestions` searches both the main ingredient name and its aliases. It excludes ingredients that are already selected, sorts the results alphabetically, and limits the suggestion list to eight items.
- `rankRecipes` converts the selected ingredients into a `Set` for quick lookup. It groups equivalent ingredient options, determines which requirements are matched or missing, and calculates a match ratio. It then filters recipes by category and sorts stronger matches before weaker ones.
- I kept this approach because PantryPal matches ingredient names rather than exact quantities. I understand that it does not determine whether the user has enough of an ingredient or whether its cut and preparation match the recipe. Those limitations are documented in the interface and README.
