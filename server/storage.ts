import { students, events, type Student, type Event, type InsertStudent, type InsertEvent } from "@shared/schema";

export interface IStorage {
  // Students
  getAllStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByStudentId(studentId: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, updates: Partial<Student>): Promise<Student | undefined>;
  
  // Events
  getAllEvents(): Promise<Event[]>;
  getEventsByStudentId(studentId: string): Promise<Event[]>;
  getRecentEvents(limit?: number): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  // Dashboard Stats
  getDashboardStats(): Promise<{
    activeStudents: number;
    totalAlerts: number;
    flaggedStudents: number;
    sessionDuration: string;
  }>;
}

export class MemStorage implements IStorage {
  private students: Map<number, Student>;
  private events: Map<number, Event>;
  private currentStudentId: number;
  private currentEventId: number;
  private sessionStartTime: Date;

  constructor() {
    this.students = new Map();
    this.events = new Map();
    this.currentStudentId = 1;
    this.currentEventId = 1;
    this.sessionStartTime = new Date();

    // Initialize with some sample students
    this.initializeSampleData();
  }

  private async initializeSampleData() {
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

  async getAllStudents(): Promise<Student[]> {
    return Array.from(this.students.values()).filter(s => s.isActive);
  }

  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(s => s.studentId === studentId);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.currentStudentId++;
    const student: Student = {
      ...insertStudent,
      id,
      lastActivity: new Date(),
    };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: number, updates: Partial<Student>): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;
    
    const updatedStudent = { ...student, ...updates, lastActivity: new Date() };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getEventsByStudentId(studentId: string): Promise<Event[]> {
    return Array.from(this.events.values())
      .filter(e => e.studentId === studentId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getRecentEvents(limit: number = 50): Promise<Event[]> {
    return Array.from(this.events.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const event: Event = {
      ...insertEvent,
      id,
      timestamp: new Date(),
    };
    this.events.set(id, event);
    return event;
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

export const storage = new MemStorage();
