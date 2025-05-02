import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  email: text('email').primaryKey(),
  name: text('name').notNull(),
  company_name: text('company_name').notNull(),
  password: text('password').notNull(),
  phone: text('phone'),
  country_code: text('country_code'),
  service_type: text('service_type').notNull(),
  images: text('images', { mode: 'json' }).notNull(),
  training_files: text('training_files', { mode: 'json' }).notNull(),
  prompt: text('prompt').notNull(),
  assistant_name: text('assistant_name'),
  address: text('address'),
  created_at: text('created_at'),
  updated_at: text('updated_at'),
});

export const password_resets = sqliteTable('password_resets', {
  token: text('token').primaryKey(),
  email: text('email').notNull(),
  expires_at: text('expires_at').notNull(),
  created_at: text('created_at'),
});

export const service_passwords = sqliteTable('service_passwords', {
  email: text('email').primaryKey(),
  password: text('password').notNull(),
  created_at: text('created_at'),
  updated_at: text('updated_at'),
});

export const franchises = sqliteTable('franchises', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  person_or_company_name: text('person_or_company_name').notNull(),
  state_id: text('state_id').notNull().unique(),
  email: text('email').notNull().unique(),
  contracted_instances: integer('contracted_instances').notNull(),
  created_at: text('created_at'),
  updated_at: text('updated_at'),
});

export const sessions = sqliteTable('sessions', {
  email: text('email').primaryKey(),
  token: text('token').notNull(),
  expires_at: text('expires_at').notNull(),
  created_at: text('created_at'),
  updated_at: text('updated_at'),
});

export const instances = sqliteTable('instances', {
  email: text('email').primaryKey(),
  ip_address: text('ip_address').notNull(),
  created_at: text('created_at'),
  updated_at: text('updated_at'),
});
