// Read-only demo collection. No server, credentials, or database are needed.
// It uses the same function names and return shapes as httpApi.js.
import seed from './seed.json'

function delay(signal) {
  return new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer)
      signal?.removeEventListener('abort', abort)
      reject(new DOMException('Request cancelled', 'AbortError'))
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort)
      resolve()
    }, 200)
    if (signal?.aborted) abort()
    else signal?.addEventListener('abort', abort, { once: true })
  })
}

export async function listRecipes({ signal } = {}) {
  await delay(signal)
  return structuredClone(seed.recipes)
}

export async function listIngredients({ signal } = {}) {
  await delay(signal)
  return structuredClone(seed.ingredients)
}

export async function getRecipe(id, { signal } = {}) {
  await delay(signal)
  const recipe = seed.recipes.find((item) => String(item.id) === String(id))
  if (!recipe) throw new Error('Recipe not found.')
  return structuredClone(recipe)
}
