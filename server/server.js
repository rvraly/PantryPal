import { pool } from './db/pool.js'
import { createApp } from './app.js'

const port = Number(process.env.PORT || 3000)
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('PORT must be an integer between 1 and 65535.')
  process.exit(1)
}
const server = createApp(pool).listen(port, () => {
  console.log(`PantryPal Express API listening on http://localhost:${port}`)
  console.log('Open /readyz to check the recipe database connection.')
})
server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE' ? `Port ${port} is already in use.` : 'Could not start the API.')
  process.exit(1)
})

let closing = false
function shutdown() {
  if (closing) return
  closing = true
  server.close(async () => {
    await pool.end()
    process.exit(0)
  })
  setTimeout(() => process.exit(1), 10000).unref()
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
