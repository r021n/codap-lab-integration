import { pgTable, serial, text, timestamp, varchar, integer, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  role: varchar('role', { length: 50 }).notNull().default('user'), // 'user' | 'admin'
  school: varchar('school', { length: 255 }),
  class: varchar('class', { length: 50 }),
  age: integer('age'),
  gender: varchar('gender', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const datasets = pgTable('datasets', {
  id: serial('id').primaryKey(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  storedName: varchar('stored_name', { length: 255 }).notNull().unique(),
  fileData: text('file_data').notNull(),
  uploadedBy: integer('uploaded_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Quiz Tables ────────────────────────────────────────────────

export const quizzes = pgTable('quizzes', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  isPublished: boolean('is_published').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const quizQuestions = pgTable('quiz_questions', {
  id: serial('id').primaryKey(),
  quizId: integer('quiz_id').references(() => quizzes.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 30 }).notNull(), // 'multiple_choice' | 'essay'
  questionText: text('question_text').notNull(),
  maxScore: integer('max_score').notNull().default(1),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const quizOptions = pgTable('quiz_options', {
  id: serial('id').primaryKey(),
  questionId: integer('question_id').references(() => quizQuestions.id, { onDelete: 'cascade' }).notNull(),
  optionText: text('option_text').notNull(),
  isCorrect: boolean('is_correct').notNull().default(false),
  orderIndex: integer('order_index').notNull().default(0),
});

export const quizSubmissions = pgTable('quiz_submissions', {
  id: serial('id').primaryKey(),
  quizId: integer('quiz_id').references(() => quizzes.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
});

export const quizAnswers = pgTable('quiz_answers', {
  id: serial('id').primaryKey(),
  submissionId: integer('submission_id').references(() => quizSubmissions.id, { onDelete: 'cascade' }).notNull(),
  questionId: integer('question_id').references(() => quizQuestions.id, { onDelete: 'cascade' }).notNull(),
  selectedOptionId: integer('selected_option_id').references(() => quizOptions.id),
  essayAnswer: text('essay_answer'),
  score: integer('score').notNull().default(0),
});

export const siteContents = pgTable('site_contents', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: text('content').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  updatedBy: integer('updated_by').references(() => users.id),
});
