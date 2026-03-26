import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["todo", "in_progress", "completed", "archived"]).default("todo").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  category: varchar("category", { length: 100 }),
  dueDate: timestamp("dueDate"),
  aiSummary: text("aiSummary"),
  aiPriority: varchar("aiPriority", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  fileUrl: varchar("fileUrl", { length: 500 }),
  fileKey: varchar("fileKey", { length: 500 }),
  mimeType: varchar("mimeType", { length: 100 }),
  tags: varchar("tags", { length: 500 }),
  category: varchar("category", { length: 100 }),
  isPublic: mysqlEnum("isPublic", ["private", "team", "public"]).default("private").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

export const taskInsights = mysqlTable("taskInsights", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull().references(() => tasks.id),
  userId: int("userId").notNull().references(() => users.id),
  insight: text("insight").notNull(),
  insightType: mysqlEnum("insightType", ["summary", "suggestion", "warning", "optimization"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TaskInsight = typeof taskInsights.$inferSelect;
export type InsertTaskInsight = typeof taskInsights.$inferInsert;

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  type: mysqlEnum("type", ["task_update", "ai_insight", "document_shared", "system"]).notNull(),
  relatedTaskId: int("relatedTaskId").references(() => tasks.id),
  relatedDocumentId: int("relatedDocumentId").references(() => documents.id),
  isRead: mysqlEnum("isRead", ["read", "unread"]).default("unread").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export const productivityMetrics = mysqlTable("productivityMetrics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  tasksCompleted: int("tasksCompleted").default(0),
  tasksCreated: int("tasksCreated").default(0),
  averagePriority: varchar("averagePriority", { length: 50 }),
  completionRate: int("completionRate").default(0),
  documentsCreated: int("documentsCreated").default(0),
  aiInsightsGenerated: int("aiInsightsGenerated").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductivityMetric = typeof productivityMetrics.$inferSelect;
export type InsertProductivityMetric = typeof productivityMetrics.$inferInsert;