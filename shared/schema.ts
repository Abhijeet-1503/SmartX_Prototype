import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull().unique(),
  name: text("name").notNull(),
  behaviorScore: integer("behavior_score").notNull().default(100),
  status: text("status").notNull().default("normal"), // normal, warning, flagged
  alertCount: integer("alert_count").notNull().default(0),
  lastActivity: timestamp("last_activity").notNull().defaultNow(),
  aiConfidence: integer("ai_confidence").notNull().default(100),
  isActive: boolean("is_active").notNull().default(true),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull(),
  event: text("event").notNull(),
  description: text("description").notNull(),
  score: integer("score").notNull(), // 0-100
  source: text("source").notNull(), // ai_face_agent, ai_gesture_agent
  priority: text("priority").notNull().default("normal"), // normal, warning, high
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  lastActivity: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  timestamp: true,
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
