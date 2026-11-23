import { int, json, mysqlTable, timestamp, unique, varchar } from 'drizzle-orm/mysql-core'

export const questions = mysqlTable('questions', {
  id: varchar({ length: 36 }).primaryKey(),
  name: varchar({ length: 200 }).notNull(),
  type: varchar({ length: 64 }).notNull(),
  locales: json().notNull(),
  draftConfig: json('draft_config').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow().onUpdateNow(),
})

export const questionVersions = mysqlTable(
  'question_versions',
  {
    id: varchar({ length: 36 }).primaryKey(),
    questionId: varchar('question_id', { length: 36 })
      .notNull()
      .references(() => questions.id, { onDelete: 'cascade' }),
    version: int().notNull(),
    type: varchar({ length: 64 }).notNull(),
    locales: json().notNull(),
    config: json().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  },
  (table) => [unique('question_versions_question_version').on(table.questionId, table.version)],
)
