import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 1. UTILISATEURS
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // UUID
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['admin', 'user'] }).default('user').notNull(),
  canViewLogs: integer('can_view_logs', { mode: 'boolean' }).default(false).notNull(),
  themeColor: text('theme_color').default('blue'), // gris, bleu, etc.
  themeMode: text('theme_mode', { enum: ['light', 'dark', 'system'] }).default('system'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 2. PROJETS
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  color: text('color').notNull(),
  deadline: text('deadline').notNull(), // NOUVEAU : Date butoir (YYYY-MM-DD)
  levelId: text('level_id').notNull().references(() => effortLevels.id), // NOUVEAU : Référence au niveau
  ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});


// 3. MEMBRES DES PROJETS (Pour le partage entre utilisateurs)
export const projectMembers = sqliteTable('project_members', {
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  autoInviteToEvents: integer('auto_invite_to_events', { mode: 'boolean' }).default(true).notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.projectId, table.userId] })
  };
});

// 4. ÉVÉNEMENTS (Les tâches / sessions générées ou ajoutées manuellement)
export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }), // <-- Sans .notNull()
  title: text('title').notNull(),
  description: text('description'),
  date: text('date').notNull(),
  isCompleted: integer('is_completed', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});



// 5. PARTICIPANTS AUX ÉVÉNEMENTS (Pour assigner qui doit faire la tâche)
export const eventParticipants = sqliteTable('event_participants', {
  eventId: text('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.eventId, table.userId] })
  };
});

// 6. LOGS SYSTÈME ET ERREURS
export const systemLogs = sqliteTable('system_logs', {
  id: text('id').primaryKey(),
  level: text('level', { enum: ['info', 'warning', 'error'] }).notNull(),
  action: text('action').notNull(),
  details: text('details'),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }), // Qui a déclenché l'action (optionnel)
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const effortLevels = sqliteTable('effort_levels', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  percentage: integer('percentage').notNull(), // ex: 30 pour 30%
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});


export const logs = sqliteTable('logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  userName: text('user_name'),       // Sauvegardé pour affichage rapide
  userEmail: text('user_email'),
  action: text('action').notNull(),    // ex: 'EVENT_COMPLETED', 'PROJECT_CREATED', 'USER_LOGIN'
  category: text('category').notNull(),// 'EVENT', 'PROJECT', 'AUTH', 'ADMIN'
  details: text('details'),           // Description textuelle
  metadata: text('metadata'),         // JSON avec IP, User-Agent, etc.
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});