import { and, eq, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, tasks, documents, taskInsights, notifications, productivityMetrics, InsertTask, Task, InsertDocument, Document, InsertTaskInsight, InsertNotification, ProductivityMetric } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Task queries
export async function createTask(userId: number, task: Omit<InsertTask, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tasks).values({ ...task, userId });
  return result;
}

export async function getUserTasks(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(tasks).where(eq(tasks.userId, userId));
}

export async function getTaskById(taskId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(tasks).where(
    and(eq(tasks.id, taskId), eq(tasks.userId, userId))
  ).limit(1);
  return result[0];
}

export async function updateTask(taskId: number, userId: number, updates: Partial<Task>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(tasks).set(updates).where(
    and(eq(tasks.id, taskId), eq(tasks.userId, userId))
  );
}

export async function deleteTask(taskId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(tasks).where(
    and(eq(tasks.id, taskId), eq(tasks.userId, userId))
  );
}

// Document queries
export async function createDocument(userId: number, doc: Omit<InsertDocument, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(documents).values({ ...doc, userId });
}

export async function getUserDocuments(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(documents).where(eq(documents.userId, userId));
}

export async function getDocumentById(docId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(documents).where(
    and(eq(documents.id, docId), eq(documents.userId, userId))
  ).limit(1);
  return result[0];
}

export async function updateDocument(docId: number, userId: number, updates: Partial<Document>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(documents).set(updates).where(
    and(eq(documents.id, docId), eq(documents.userId, userId))
  );
}

export async function deleteDocument(docId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(documents).where(
    and(eq(documents.id, docId), eq(documents.userId, userId))
  );
}

// Task Insight queries
export async function createTaskInsight(userId: number, insight: Omit<InsertTaskInsight, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(taskInsights).values({ ...insight, userId });
}

export async function getTaskInsights(taskId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(taskInsights).where(eq(taskInsights.taskId, taskId));
}

// Notification queries
export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(notifications).values(notification);
}

export async function getUserNotifications(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(notifications).where(eq(notifications.userId, userId));
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(notifications).set({ isRead: 'read' }).where(eq(notifications.id, notificationId));
}

// Productivity Metrics queries
export async function getOrCreateMetrics(userId: number, date: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(productivityMetrics).where(
    and(eq(productivityMetrics.userId, userId), eq(productivityMetrics.date, date))
  ).limit(1);
  
  if (existing.length > 0) return existing[0];
  
  const result = await db.insert(productivityMetrics).values({
    userId,
    date,
    tasksCompleted: 0,
    tasksCreated: 0,
    completionRate: 0,
    documentsCreated: 0,
    aiInsightsGenerated: 0,
  });
  return result;
}

export async function updateMetrics(userId: number, date: Date, updates: Partial<ProductivityMetric>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(productivityMetrics).set(updates).where(
    and(eq(productivityMetrics.userId, userId), eq(productivityMetrics.date, date))
  );
}

export async function getUserMetrics(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(productivityMetrics).where(
    and(
      eq(productivityMetrics.userId, userId),
      gte(productivityMetrics.date, startDate),
      lte(productivityMetrics.date, endDate)
    )
  );
}
