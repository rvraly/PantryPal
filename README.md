# PantryPal: Ingredient-Based Recipe Finder

PantryPal is a responsive Filipino recipe finder for home cooks who want to use ingredients they already have. The project includes 100 recipes and 193 searchable ingredients.

## What it does

- Accepts ingredient names in English or Filipino.
- Provides ingredient suggestions, common picks, and pantry-basic checkboxes.
- Ranks recipes according to the selected ingredients and shows what is missing.
- Filters recipes by category.
- Shows recipe ingredients, quantities, instructions, preparation details, cooking details, and cookbook tips.
- Includes **Surprise me!** for opening a random suitable recipe.
- Includes the **Lutong Bahay Challenge**, which selects a recipe challenge from the available matches.
- Lets users select **Nailuto ko!** and save the cooking date and personal notes.
- Keeps completed dishes in **My Cooking Journal** and awards a **First Lutong Bahay** badge after the first entry.
- Works on desktop and mobile without requiring an account.

Cooking-journal entries are stored in the current browser using local storage. They remain after a normal refresh, but clearing site data removes them and they do not automatically sync between devices.

## How to run it

### Requirements

- Node.js 24.x with npm
- Git
- A Supabase project and PostgreSQL connection string for live database mode

Clone the repository:

```powershell
git clone https://github.com/rvraly/PantryPal.git
cd PantryPal
```

### Option 1: Run the frontend in demo mode

Demo mode uses the bundled recipe collection and does not require the server or database.

```powershell
cd client
npm ci
Copy-Item .env.example .env
npm run dev
```

Keep `VITE_USE_MOCK_API=true` in `client/.env`, then open http://localhost:5173/.

### Option 2: Run the complete app with Supabase

First, create `server/.env` with placeholder values replaced by your own local configuration:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/postgres
DATABASE_CA_CERT=./supabase-ca.crt
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
NODE_ENV=development
```

Save the Supabase root certificate as `server/supabase-ca.crt`. Never commit `server/.env` or a real database password.

Install the server dependencies and prepare a new database:

```powershell
cd server
npm ci
npm run db:reset
npm run dev
```

Skip `npm run db:reset` if the database already contains the PantryPal tables and data. Keep the server terminal open. Check http://localhost:3000/readyz; a working database should report `100` recipes and `193` ingredients.

In a second terminal, create `client/.env`:

```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:3000
```

Then start the frontend:

```powershell
cd client
npm ci
npm run dev -- --port 5173 --strictPort
```

Open http://localhost:5173/. Stop either development server with **Ctrl + C**. Restart the corresponding server after changing an environment file.

## Licence

The PantryPal source code is provided under the MIT Licence. See [LICENSE](LICENSE).

The MIT Licence applies to the project code only. It does not grant rights to third-party recipe text, fonts, or other externally sourced material.

## Credits

- Recipe information was prepared from *The Easy Filipino Cookbook*. Source titles and printed page references are retained in the recipe records. Redistribution permission for the cookbook material has not been established, so the cookbook content is not covered by the project's MIT Licence.
- **DM Sans** and **Manrope** are loaded through [Google Fonts](https://fonts.google.com/).
- The frontend uses [React](https://react.dev/) and [Vite](https://vite.dev/).
- The backend uses [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), and [node-postgres](https://node-postgres.com/).
- PostgreSQL hosting and database tools are provided by [Supabase](https://supabase.com/).
- The initial full-stack structure and deployment workflow were adapted from the course final-project template.
