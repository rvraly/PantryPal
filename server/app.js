import express from 'express'
import cors from 'cors'
import * as recipes from './recipesRepo.js'

const databaseError = 'Could not read the recipe database. Check the server configuration and database connection.'

export function createApp(pool, { origins = process.env.CORS_ORIGINS, logger = console } = {}) {
  const app = express()
  app.disable('x-powered-by')
  const allowedOrigins = (origins || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',').map((origin) => origin.trim().replace(/\/+$/, '')).filter(Boolean)
  app.use(cors({ origin: allowedOrigins, methods: ['GET', 'HEAD', 'OPTIONS'] }))

  const route = (handler) => (request, response, next) => {
    Promise.resolve(handler(request, response)).catch(next)
  }
  const logFailure = (error) => {
    const code = /^[A-Z0-9_]{2,40}$/.test(error?.code || '') ? error.code : 'DATABASE_ERROR'
    logger.warn(`Database request failed (${code}).`)
  }
  const filter = (value) => {
    if (value === undefined) return ''
    if (typeof value !== 'string' || value.length > 100) {
      const error = new Error('Filters must be single text values of 100 characters or fewer.')
      error.status = 400
      throw error
    }
    return value.trim()
  }

  app.get('/', (request, response) => {
    response.json({ message: 'PantryPal Express API is running', health: '/healthz', database: '/readyz' })
  })
  app.get('/healthz', (request, response) => response.json({ ok: true }))

  app.get('/readyz', route(async (request, response) => {
    try {
      const counts = await recipes.getCounts(pool)
      response.json({ ok: true, db: 'up', ...counts })
    } catch (error) {
      logFailure(error)
      response.status(503).json({ ok: false, db: 'down', error: databaseError })
    }
  }))

  app.get('/api/recipes', route(async (request, response) => {
    const q = filter(request.query.q)
    const category = filter(request.query.category)
    const rows = await recipes.getAll(pool, { q, category })
    response.json({ recipes: rows, total: rows.length })
  }))

  app.get('/api/recipes/:id', route(async (request, response) => {
    const id = Number(request.params.id)
    if (!/^[1-9]\d*$/.test(request.params.id) || !Number.isSafeInteger(id)) {
      return response.status(400).json({ error: 'Recipe ID must be a positive safe integer.' })
    }
    const recipe = await recipes.getById(pool, id)
    if (!recipe) return response.status(404).json({ error: 'Recipe not found.' })
    response.json({ recipe })
  }))

  app.get('/api/ingredients', route(async (request, response) => {
    const rows = await recipes.getIngredients(pool, filter(request.query.q))
    response.json({ ingredients: rows, total: rows.length })
  }))

  app.use((request, response) => response.status(404).json({ error: 'No such route.' }))
  app.use((error, request, response, next) => {
    if (error.status === 400) return response.status(400).json({ error: error.message })
    logFailure(error)
    response.status(503).json({ error: databaseError })
  })
  return app
}
