import { drizzle } from 'drizzle-orm/mysql2'
import { migrate } from 'drizzle-orm/mysql2/migrator'
import type { TestProject } from 'vitest/node'

export default async function applyMigrations(project: TestProject) {
  const db = drizzle({ connection: { uri: project.config.env.DATABASE_URL } })
  await migrate(db, { migrationsFolder: 'drizzle' })
  await db.$client.end()
}
