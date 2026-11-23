import { drizzle } from 'drizzle-orm/mysql2'
import { env } from '#/env'

function createDb() {
  return drizzle({ connection: { uri: env.DATABASE_URL } })
}

let db: ReturnType<typeof createDb> | undefined

export function getDb() {
  db ??= createDb()
  return db
}
