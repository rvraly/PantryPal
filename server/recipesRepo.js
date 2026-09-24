// SQL belongs here. User input is passed separately as query parameters.
const pattern = (value) => `%${value.replace(/[\\%_]/g, '\\$&')}%`

function normalizeRecipe(row) {
  if (!row) return null
  const id = Number(row.id)
  if (!Number.isSafeInteger(id) || id < 1) throw new Error('Unsupported recipe ID.')
  return { ...row, id }
}

export async function getAll(pool, { q = '', category = '' } = {}) {
  const result = await pool.query(
    `SELECT * FROM public.recipes
     WHERE ($1::text = '' OR name ILIKE $2 OR COALESCE(filipino_name, '') ILIKE $2)
       AND ($3::text = '' OR category = $3)
     ORDER BY id`,
    [q, pattern(q), category === 'All recipes' ? '' : category],
  )
  return result.rows.map(normalizeRecipe)
}

export async function getById(pool, id) {
  const result = await pool.query('SELECT * FROM public.recipes WHERE id = $1', [id])
  return normalizeRecipe(result.rows[0])
}

export async function getIngredients(pool, q = '') {
  const result = await pool.query(
    `SELECT id, name, aliases FROM public.ingredients
     WHERE $1::text = '' OR name ILIKE $2
       OR EXISTS (SELECT 1 FROM unnest(aliases) AS alias WHERE alias ILIKE $2)
     ORDER BY name`,
    [q, pattern(q)],
  )
  return result.rows
}

export async function getCounts(pool) {
  const result = await pool.query(
    `SELECT (SELECT count(*)::integer FROM public.recipes) AS recipes,
            (SELECT count(*)::integer FROM public.ingredients) AS ingredients`,
  )
  return result.rows[0]
}
