import { is, sql } from 'drizzle-orm'
import { MySqlTable } from 'drizzle-orm/mysql-core'
import { getDb } from '#/db/client.server'
import * as schema from '#/db/schema'
import { env } from '#/env'

const tables = Object.values(schema).filter((value) => is(value, MySqlTable))

export async function resetDatabase() {
  if (!new URL(env.DATABASE_URL).pathname.endsWith('_test')) {
    throw new Error(`Refusing to reset ${env.DATABASE_URL}: integration tests only run against a *_test database`)
  }
  await getDb().transaction(async (transaction) => {
    await transaction.execute(sql`set foreign_key_checks = 0`)
    try {
      for (const table of tables) await transaction.delete(table)
    } finally {
      await transaction.execute(sql`set foreign_key_checks = 1`)
    }
  })
}
