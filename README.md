# PantryPal: Ingredient-Based Recipe Finder

PantryPal is a responsive web app for home cooks who want to find Filipino recipes using ingredients they already have. It helps users decide what to cook and see which ingredients they still need.

The current collection contains **100 recipes and 193 searchable ingredients**. The Express backend has been connected locally to the Supabase database, with those record counts confirmed by the database health check. Public deployment is not yet complete.

**Live site:** Deployment pending.  
**API:** Public deployment pending. Local address: `http://localhost:3000`.  
**Demo video:** To be added.

> **Current progress:** The Express backend connects to Supabase and reads 100 recipes and 193 ingredients. The frontend supports both demo mode and live database mode. A working local connection does not mean the app has been deployed publicly.

## What it does

- Search for ingredients using English or Filipino names.
- Add ingredients through suggestions, common picks, and pantry basics checkboxes.
- Rank recipes by ingredient matches and show missing ingredient groups.
- Filter results by category.
- View ingredient quantities, instructions, preparation and cooking details, and cookbook tips.
- Use **Surprise me!** to choose a recipe from complete matches or the highest-ranked results.
- Browse on desktop or mobile without an account.

### How to use it

1. Open the app and add the ingredients you have.
2. Select only the pantry basics available in your kitchen.
3. Click **Find recipes** to scroll to the results. Results update as ingredients change.
4. Choose a category if you want to narrow the results.
5. Check the matched and missing ingredients, then click **View recipe**.
6. Remove an ingredient chip or select **Clear all** to change your selection. Use **Show more recipes** to see additional results.

### Screenshots

See [system screenshots](docs/assets/) for images of PantryPal in use.

## Built with

| Part             | Technology                    |
| ---------------- | ----------------------------- |
| Frontend         | React and Vite                |
| Backend          | Node.js and Express           |
| Database         | PostgreSQL hosted on Supabase |
| Database queries | `pg` (node-postgres)          |

The recipe collection was prepared from _The Easy Filipino Cookbook_. Recipe details retain source references.

## Demo mode

The frontend supports two data sources, selected by `VITE_USE_MOCK_API` in `client/.env`.

| Setting                           | Behavior                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------- |
| `false`                           | Requests recipes and ingredients from Express, which reads Supabase PostgreSQL.       |
| `true`, unset, or any other value | Loads the bundled collection from `client/src/api/seed.json` and shows a demo notice. |

Demo mode does not require a running backend. It uses read-only bundled data, not `localStorage`. Ingredient selections reset after a page refresh in both modes. Live mode does not automatically switch to demo data when a request fails.

Restart the frontend after changing its environment settings. For a deployed frontend, these settings are applied during the build.

## Running it yourself

The following instructions use **Windows PowerShell** and run the app locally with Supabase data.

### 1. Install the requirements and get the code

Install **Node.js 24.x with npm**, **Git**, and a code editor such as VS Code. You also need a Supabase project and an internet connection.

```powershell
git clone https://github.com/rvraly/PantryPal.git
cd PantryPal
```

Run the remaining steps from this project folder. If you already have the project in `C:\Projects\pantrypal-template`, use that folder instead of cloning another copy.

### 2. Install the backend dependencies

From the project root:

```powershell
cd server
npm ci
```

### 3. Configure the database connection

In your Supabase project's **Connect** dialog, copy the **Session pooler PostgreSQL connection string** and enter your database password in its password field. Use the database password, not an API key. Reserved characters in the password must be percent-encoded; for example, `@` becomes `%40`.

Create `server/.env`. On its first line, type `DATABASE_URL=` immediately followed by your complete connection string. Keep the value on that same line.

Add these lines underneath:

```dotenv
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
NODE_ENV=development
DATABASE_CA_CERT=./supabase-ca.crt
```

Download the server root certificate from **Database Settings → SSL Configuration** in Supabase. Save it as `server/supabase-ca.crt`. This setup uses the certificate to verify the database connection and resolves the `SELF_SIGNED_CERT_IN_CHAIN` error encountered during development.

Keep `.env`, `package.json`, `app.js`, and `server.js` directly inside the same `server` folder. The environment filename must be `.env`, not `.env.txt`. Keep real credentials out of Git and the README.

### 4. Create and seed the tables

**Skip this step if your database already contains PantryPal's 100 recipes and 193 ingredients.**

For a new Supabase database, run from `server` after configuring the connection:

```powershell
npm run db:reset
```

This runs `server/db/schema.sql` followed by `server/db/seed.sql`. The PantryPal scripts create missing tables and insert the recipe and ingredient collection. They do not truncate existing tables, and rows with existing IDs are left unchanged. They are intended for the PantryPal schema on Supabase and do not migrate an incompatible schema.

Alternatively, run `schema.sql` and then `seed.sql` in the Supabase SQL Editor.

### 5. Start the backend

From `server`:

```powershell
npm run dev
```

Open [the database health check](http://localhost:3000/readyz). With the supplied collection loaded, the expected response is:

```json
{
  "ok": true,
  "db": "up",
  "recipes": 100,
  "ingredients": 193
}
```

Keep this terminal running. This response confirms the backend can read the database; the frontend also needs the live-mode configuration below.

### 6. Configure and start the frontend

Open a second terminal at the project root:

```powershell
cd client
npm ci
```

Create `client/.env` with:

```dotenv
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:3000
```

Start the frontend:

```powershell
npm run dev -- --port 5173 --strictPort
```

Open [PantryPal locally](http://localhost:5173). The ingredient selector and recipe collection should appear without the demo notice. Keep both terminals running while using the app.

After changing either `.env` file, stop the corresponding server with **Ctrl + C** and restart it.

### API usage

The API runs locally at `http://localhost:3000` and is read-only.

| Method | Path               | Purpose                                                                     |
| ------ | ------------------ | --------------------------------------------------------------------------- |
| GET    | `/`                | Shows the API running message and health-check paths.                       |
| GET    | `/healthz`         | Checks whether the API process is running.                                  |
| GET    | `/readyz`          | Checks database access and returns recipe and ingredient counts.            |
| GET    | `/api/recipes`     | Returns `{ recipes, total }`. Supports optional `q` and `category` filters. |
| GET    | `/api/recipes/:id` | Returns `{ recipe }` for one recipe. An unknown ID returns 404.             |
| GET    | `/api/ingredients` | Returns `{ ingredients, total }`. Optional `q` searches names and aliases.  |

Examples you can open in a browser:

- [Search recipes for adobo](http://localhost:3000/api/recipes?q=adobo)
- [Search ingredients for bawang](http://localhost:3000/api/ingredients?q=bawang)
- [Read recipe 1](http://localhost:3000/api/recipes/1)

## Environment variables

| Variable            | Location                   | Value or purpose                                                                       |
| ------------------- | -------------------------- | -------------------------------------------------------------------------------------- |
| `DATABASE_URL`      | `server/.env`              | Your complete Supabase Session pooler PostgreSQL URI, including the database password. |
| `DATABASE_CA_CERT`  | `server/.env`              | `./supabase-ca.crt` for the certificate used by this setup.                            |
| `CORS_ORIGINS`      | `server/.env`              | `http://localhost:5173,http://127.0.0.1:5173`                                          |
| `NODE_ENV`          | Server environment         | `development` locally; `production` for deployment.                                    |
| `PORT`              | Server environment         | Defaults to `3000` locally; supplied by the API host when deployed.                    |
| `VITE_USE_MOCK_API` | `client/.env`              | `false` for database mode; `true` for the bundled demo.                                |
| `VITE_API_BASE_URL` | `client/.env`              | `http://localhost:3000` for local development.                                         |
| `VITE_BASE_PATH`    | Frontend build environment | Defaults to `/`; the Pages workflow supplies the repository path for deployment.       |

All `VITE_` values become public frontend configuration. Database credentials belong only in the backend environment. Keep actual `.env` files ignored by Git; example files must not contain real credentials.

## Deploying

The frontend and Express API currently run locally. Supabase already hosts the database. A public frontend and API deployment remain part of the next steps.

The repository includes the template's GitHub Pages workflow for the frontend. Express requires a separate Node.js host. The public frontend will need the deployed API URL, and the API's CORS configuration must allow the frontend's origin. Local addresses cannot be used by visitors to the public site.

## Project structure

| Path                                    | Purpose                                                                |
| --------------------------------------- | ---------------------------------------------------------------------- |
| `client/src/App.jsx`                    | Renders the recipe finder.                                             |
| `client/src/pages/FindRecipes.jsx`      | Ingredient selection, results, and recipe details.                     |
| `client/src/services/recipeMatching.js` | Ingredient suggestions and recipe ranking.                             |
| `client/src/api/index.js`               | Selects the demo or HTTP implementation.                               |
| `client/src/api/mockApi.js`             | Reads the bundled collection.                                          |
| `client/src/api/httpApi.js`             | Requests data from Express.                                            |
| `client/src/api/seed.json`              | Demo recipes and ingredients.                                          |
| `client/src/components/DemoNotice.jsx`  | Displays the demo notice.                                              |
| `client/src/styles.css`                 | Responsive interface styles.                                           |
| `server/server.js`                      | Starts the Express server.                                             |
| `server/app.js`                         | Routes, validation, and HTTP responses.                                |
| `server/recipesRepo.js`                 | Parameterized database queries.                                        |
| `server/db/`                            | Database configuration, connection pool, schema, seed, and SQL runner. |
| `.github/workflows/deploy-pages.yml`    | Frontend deployment workflow.                                          |
| `docs/`                                 | Supporting documentation and screenshot assets.                        |
| `README.md`                             | Setup, usage, and project documentation.                               |

## Architecture

In live mode, React requests recipes and ingredients from Express. Express queries Supabase PostgreSQL through the `pg` connection pool, with SQL kept in `recipesRepo.js`. React ranks recipes in the browser using the selected ingredients. In demo mode, the same frontend API interface returns bundled data without contacting the backend.

## What I would do next

- Add a PantryPal logo and refine the interface.
- Add favorites and personal notes; consider optional photos for saved recipes.
- Test recipe matching and mobile usability further, deploy the frontend and API, and record the final demonstration.

### Known limitations and troubleshooting

- Matching checks ingredient names, not quantities or exact cuts. Users must check each recipe's amounts and preparation requirements.
- Recipes containing alternatives or subrecipes need further matching review.
- Favorites, personal notes, and photo uploads are not implemented. Ingredient selections are not saved after refresh.
- If Node reports `.env: not found`, check that the file is saved directly in `server` and run the command from that folder.
- If the database check fails, check the connection string, database password, certificate path, and table setup. Certificate verification must remain enabled.
- If the demo notice remains visible, set `VITE_USE_MOCK_API=false` in `client/.env` and restart Vite.
- If port 5173 is already in use, stop the other frontend process before restarting.

## Author

[rvraly](https://github.com/rvraly) — Final project for 6APSI, CS - 402.

## License

The project code uses the MIT licence; see [LICENSE](LICENSE).

The recipe dataset contains material extracted from _The Easy Filipino Cookbook_. Source references are retained. Redistribution permission has not been established; the code's MIT licence does not cover the third-party cookbook material.
