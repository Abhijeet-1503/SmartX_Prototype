import { students, events, users, type Student, type Event, type InsertStudent, type InsertEvent, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Students
  getAllStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByStudentId(studentId: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, updates: Partial<Student>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;
  
  // Events
  getAllEvents(): Promise<Event[]>;
  getEventsByStudentId(studentId: string): Promise<Event[]>;
  getRecentEvents(limit?: number): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  deleteEvent(id: number): Promise<boolean>;
  clearAllEvents(): Promise<boolean>;
  
  // Dashboard Stats
  getDashboardStats(): Promise<{
    activeStudents: number;
    totalAlerts: number;
    flaggedStudents: number;
    sessionDuration: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  private sessionStartTime: Date;

  constructor() {
    this.sessionStartTime = new Date();
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Initialize users first
    const existingUsers = await db.select().from(users);
    if (existingUsers.length === 0) {
      const defaultUsers: InsertUser[] = [
        { username: "god", password: "dev2025!", role: "god", name: "Developer God", email: "dev@smartproctor.com", isActive: true },
        { username: "admin", password: "admin123", role: "admin", name: "System Admin", email: "admin@smartproctor.com", isActive: true },
        { username: "teacher1", password: "teacher123", role: "teacher", name: "John Teacher", email: "john@smartproctor.com", isActive: true },
        { username: "teacher2", password: "teacher123", role: "teacher", name: "Jane Teacher", email: "jane@smartproctor.com", isActive: true },
      ];

      for (const user of defaultUsers) {
        await this.createUser(user);
      }
    }

    // Check if students already exist in database
    const existingStudents = await db.select().from(students);
    if (existingStudents.length === 0) {
      const sampleStudents: InsertStudent[] = [
        { studentId: "STU101", name: "Alex Johnson", behaviorScore: 95, status: "normal", alertCount: 0, aiConfidence: 98, isActive: true },
        { studentId: "STU102", name: "Sarah Chen", behaviorScore: 73, status: "warning", alertCount: 2, aiConfidence: 76, isActive: true },
        { studentId: "STU103", name: "Mike Rodriguez", behaviorScore: 42, status: "flagged", alertCount: 5, aiConfidence: 45, isActive: true },
        { studentId: "STU104", name: "Emma Wilson", behaviorScore: 89, status: "normal", alertCount: 0, aiConfidence: 92, isActive: true },
        { studentId: "STU105", name: "David Park", behaviorScore: 91, status: "normal", alertCount: 0, aiConfidence: 88, isActive: true },
        { studentId: "STU106", name: "Lisa Zhang", behaviorScore: 71, status: "warning", alertCount: 1, aiConfidence: 68, isActive: true },
        { studentId: "STU107", name: "John Smith", behaviorScore: 86, status: "normal", alertCount: 0, aiConfidence: 94, isActive: true },
        { studentId: "STU108", name: "Ana Garcia", behaviorScore: 39, status: "flagged", alertCount: 3, aiConfidence: 38, isActive: true },
      ];

      for (const student of sampleStudents) {
        await this.createStudent(student);
      }
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, lastLogin: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isActive, true));
  }

  // Student methods
  async getAllStudents(): Promise<Student[]> {
    return await db.select().from(students).where(eq(students.isActive, true));
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || undefined;
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.studentId, studentId));
    return student || undefined;
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db
      .insert(students)
      .values(insertStudent)
      .returning();
    return student;
  }

  async updateStudent(id: number, updates: Partial<Student>): Promise<Student | undefined> {
    const [updatedStudent] = await db
      .update(students)
      .set({ ...updates, lastActivity: new Date() })
      .where(eq(students.id, id))
      .returning();
    return updatedStudent || undefined;
  }

  async deleteStudent(id: number): Promise<boolean> {
    const [deletedStudent] = await db
      .update(students)
      .set({ isActive: false })
      .where(eq(students.id, id))
      .returning();
    return !!deletedStudent;
  }

  // Event methods
  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.timestamp));
  }

  async getEventsByStudentId(studentId: string): Promise<Event[]> {
    return await db.select().from(events)
      .where(eq(events.studentId, studentId))
      .orderBy(desc(events.timestamp));
  }

  async getRecentEvents(limit: number = 50): Promise<Event[]> {
    return await db.select().from(events)
      .orderBy(desc(events.timestamp))
      .limit(limit);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(insertEvent)
      .returning();
    return event;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const [deletedEvent] = await db
      .delete(events)
      .where(eq(events.id, id))
      .returning();
    return !!deletedEvent;
  }

  async clearAllEvents(): Promise<boolean> {
    await db.delete(events);
    return true;
  }

  async getDashboardStats() {
    const allStudents = await this.getAllStudents();
    const activeStudents = allStudents.length;
    const totalAlerts = allStudents.reduce((sum, s) => sum + s.alertCount, 0);
    const flaggedStudents = allStudents.filter(s => s.status === "flagged").length;
    
    const now = new Date();
    const diffMs = now.getTime() - this.sessionStartTime.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const sessionDuration = `${hours}h ${minutes}m`;

    return {
      activeStudents,
      totalAlerts,
      flaggedStudents,
      sessionDuration,
    };
  }
}

export const storage = new DatabaseStorage();
