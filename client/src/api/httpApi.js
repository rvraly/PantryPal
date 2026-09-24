// Contract for the upcoming PantryPal Express routes.
// Keep demo mode enabled until those routes and the database are connected.
const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

async function request(path, { signal } = {}) {
  const response = await fetch(`${BASE}${path}`, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error(`Recipe request failed (${response.status}).`)
  }
  return response.json()
}

export async function listRecipes(options) {
  const body = await request('/api/recipes', options)
  if (!Array.isArray(body.recipes)) throw new Error('Invalid recipe response.')
  return body.recipes
}

export async function listIngredients(options) {
  const body = await request('/api/ingredients', options)
  if (!Array.isArray(body.ingredients)) throw new Error('Invalid ingredient response.')
  return body.ingredients
}

export async function getRecipe(id, options) {
  const body = await request(`/api/recipes/${encodeURIComponent(id)}`, options)
  if (!body.recipe || typeof body.recipe !== 'object' || Array.isArray(body.recipe)) {
    throw new Error('Invalid recipe response.')
  }
  return body.recipe
}
