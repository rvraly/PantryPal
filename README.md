# PantryPal: Ingredient-Based Recipe Finder

**Live site:** https://rvraly.github.io/PantryPal/

## 1. Overview

PantryPal is a responsive Filipino recipe finder for home cooks who want to use ingredients they already have. It helps users discover suitable dishes, identify missing ingredients, and record dishes they have cooked. The current collection contains 100 recipes and 193 searchable ingredients.

The GitHub Pages site currently uses bundled demo data. The Express API connects successfully to Supabase locally but has not yet been publicly deployed.

## 2. Setup and installation

### Requirements

- Node.js 24.x with npm
- Git
- A Supabase project and internet connection for database mode

### Get the code

```powershell
git clone https://github.com/rvraly/PantryPal.git
cd PantryPal
```

### Install dependencies

```powershell
cd server
npm ci
cd ../client
npm ci
cd ..
```

### Configure the server

Create `server/.env` using placeholder values like these:

```env
DATABASE_URL=postgresql://USER:YOUR_PASSWORD@YOUR_HOST:6543/postgres
DATABASE_CA_CERT=./supabase-ca.crt
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
NODE_ENV=development
```

Download the Supabase root certificate and save it as `server/supabase-ca.crt`. Never commit `server/.env`, a real connection string, password, or secret key.

### Configure the client

For database mode, create `client/.env`:

```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:3000
```

For demo mode, use:

```env
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=http://localhost:3000
```

### Environment variables

| Variable | Location | Example or purpose |
|---|---|---|
| `DATABASE_URL` | `server/.env` | Supabase Session pooler PostgreSQL URI with placeholder credentials |
| `DATABASE_CA_CERT` | `server/.env` | `./supabase-ca.crt` |
| `CORS_ORIGINS` | `server/.env` | `http://localhost:5173,http://127.0.0.1:5173` |
| `NODE_ENV` | Server | `development` locally or `production` when deployed |
| `PORT` | Server | Defaults to `3000`; normally supplied by the deployment host |
| `VITE_USE_MOCK_API` | `client/.env` | `true` for demo data or `false` for the Express API |
| `VITE_API_BASE_URL` | `client/.env` | `http://localhost:3000` locally |
| `VITE_BASE_PATH` | Frontend build | Defaults to `/`; the Pages workflow supplies the deployed base path |

### Set up and seed the database

After configuring `server/.env`, run:

```powershell
cd server
npm run db:reset
```

This runs `server/db/schema.sql` and `server/db/seed.sql`. Skip this command if the Supabase database already contains PantryPal's 100 recipes and 193 ingredients. The SQL files can also be run in the Supabase SQL Editor, with the schema executed before the seed.

## 3. How to run it

### Run with Supabase

Start the API from the `server` folder:

```powershell
npm run dev
```

Open http://localhost:3000/readyz. A successful database check should report:

```json
{
  "ok": true,
  "db": "up",
  "recipes": 100,
  "ingredients": 193
}
```

Keep the API running. In a second terminal, start the client:

```powershell
cd client
npm run dev -- --port 5173 --strictPort
```

Open http://localhost:5173/. The PantryPal hero, ingredient selector, and recipe results should appear. When `VITE_USE_MOCK_API=false`, the demo notice should not appear.

### Run only the demo frontend

Set `VITE_USE_MOCK_API=true` in `client/.env`, then run:

```powershell
cd client
npm run dev
```

Demo mode uses the bundled recipe collection and does not require the server or Supabase.

## 4. Features and usage

- Search for ingredients using English or Filipino names.
- Add common ingredients and pantry basics.
- Rank recipes by ingredient matches and show missing ingredient groups.
- Filter recipes by category and open full cooking instructions.
- Use **Surprise me!** to open a random suitable recipe.
- Use the **Lutong Bahay Challenge** to receive a recipe challenge.
- Select **Nailuto ko!** to save the cooking date and personal notes.
- Review completed dishes in **My Cooking Journal**.
- Earn the **First Lutong Bahay** badge after saving the first cooked dish.

### Main flow

1. Add the ingredients available in your kitchen.
2. Select any pantry basics you have.
3. Review the ranked recipes and missing ingredients.
4. Filter the results or open a recipe to read its instructions.
5. Optionally accept a Lutong Bahay Challenge.
6. After cooking, select **Nailuto ko!** and save a date and note.
7. Review the saved entry in **My Cooking Journal**.

Journal entries use browser local storage. They remain after refreshing, but clearing site data removes them and they do not automatically sync between devices.

### API endpoints

The local Express API is read-only and runs at `http://localhost:3000`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Shows the API status and health-check paths |
| GET | `/healthz` | Checks whether the API process is running |
| GET | `/readyz` | Checks the database and returns record counts |
| GET | `/api/recipes` | Lists recipes; supports optional `q` and `category` filters |
| GET | `/api/recipes/:id` | Returns one recipe or a 404 response |
| GET | `/api/ingredients` | Lists ingredients; optional `q` searches names and aliases |

## 5. Project structure

| Path | Purpose |
|---|---|
| `client/src/pages/FindRecipes.jsx` | Ingredient selection, results, recipe details, challenge, and journal integration |
| `client/src/components/cooking/` | Challenge, cooked-recipe form, journal, and cooking-log components |
| `client/src/hooks/useCookingJournal.js` | Cooking-journal state management |
| `client/src/services/cookingJournal.js` | Browser local-storage operations |
| `client/src/services/recipeMatching.js` | Ingredient suggestions and recipe ranking |
| `client/src/api/` | Demo and Express API implementations |
| `client/src/api/seed.json` | Bundled demo recipe and ingredient data |
| `client/src/styles.css` | Main responsive interface styling |
| `client/src/cooking.css` | Challenge and journal styling |
| `server/app.js` | Express routes, validation, and error responses |
| `server/recipesRepo.js` | Parameterized PostgreSQL queries |
| `server/db/` | Connection, schema, seed data, and SQL runner |
| `docs/assets/` | Project screenshots |

## 6. Screenshots

![PantryPal ingredient selector](docs/assets/screenshot1.png)

![PantryPal recipe results](docs/assets/screenshot2.png)

![PantryPal recipe details](docs/assets/screenshot3.png)

## 7. Known issues and next steps

- The Express API is not publicly deployed, so the live GitHub Pages site currently uses demo data.
- Ingredient matching checks ingredient names, not exact amounts or cuts.
- Ingredient selections are not saved after refreshing.
- Cooking-journal entries are limited to the current browser and device.
- Supabase Row Level Security and a least-privileged database role still need final verification.
- GitHub Actions dependencies still need to be pinned to complete commit SHAs.
- The cookbook material and other assets still need a final permission and credit review.
- Future improvements may include a PantryPal logo, journal export/import, and optional cooking photos.

## AI usage

The required `AI-USAGE.md` is still being prepared and will be added as development continues. ChatGPT has been used to assist with planning, debugging, code suggestions, documentation, and security review. All suggestions are reviewed, adapted, and tested by the developer.

## Licence and credits

The PantryPal source code is provided under the MIT Licence. See [LICENSE](LICENSE). The MIT Licence applies to the project code only and does not grant rights to third-party material.

- Recipe information was prepared from *The Easy Filipino Cookbook*. Source titles and printed page references are retained. Redistribution permission for the cookbook material has not been established, so it is not covered by the project's MIT Licence.
- **DM Sans** and **Manrope** are loaded through [Google Fonts](https://fonts.google.com/).
- The frontend uses [React](https://react.dev/) and [Vite](https://vite.dev/).
- The backend uses [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), and [node-postgres](https://node-postgres.com/).
- PostgreSQL hosting and database tools are provided by [Supabase](https://supabase.com/).
- The initial project structure and deployment workflow were adapted from the course final-project template.
