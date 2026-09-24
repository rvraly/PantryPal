import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function databaseConfig(env = process.env) {
  if (!env.DATABASE_URL || env.DATABASE_URL.includes('paste-your-')) {
    throw new Error('Set DATABASE_URL in server/.env to your Supabase Session pooler connection string.')
  }
  let url
  try { url = new URL(env.DATABASE_URL) } catch {
    throw new Error('DATABASE_URL must be a PostgreSQL connection string, not a Supabase API URL.')
  }
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error('DATABASE_URL must begin with postgresql:// or postgres://.')
  }
  if (!url.hostname || !url.username || !url.password || url.password.includes('YOUR-PASSWORD')) {
    throw new Error('Fill in the database username, host, and database password in DATABASE_URL.')
  }
  const local = ['localhost', '127.0.0.1', '[::1]', 'db'].includes(url.hostname)
  // Keep SSL configuration in one place: pg connection-string options would
  // otherwise overwrite the certificate and verification settings below.
  for (const name of ['ssl', 'sslmode', 'sslrootcert', 'sslcert', 'sslkey', 'uselibpqcompat']) {
    url.searchParams.delete(name)
  }
  let ssl = false
  if (!local) {
    ssl = { rejectUnauthorized: true }
    if (env.DATABASE_CA_CERT?.trim()) {
      try { ssl.ca = readFileSync(resolve(env.DATABASE_CA_CERT.trim()), 'utf8') } catch {
        throw new Error('Could not read DATABASE_CA_CERT. Check the certificate file path in server/.env.')
      }
    }
  }
  return {
    connectionString: url.toString(),
    ssl,
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
    statement_timeout: 15000,
    application_name: 'pantrypal',
  }
}
