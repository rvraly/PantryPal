import pg from 'pg'
import { databaseConfig } from './config.js'

let config
try { config = databaseConfig() } catch (error) {
  console.error(error.message)
  process.exit(1)
}
export const pool = new pg.Pool(config)
pool.on('error', () => {
  console.error('A database connection was lost. Check the Supabase project and network connection.')
})
