export interface Student {
  id: number;
  studentId: string;
  name: string;
  behaviorScore: number;
  status: "normal" | "warning" | "flagged";
  alertCount: number;
  lastActivity: string;
  aiConfidence: number;
  isActive: boolean;
}

export interface Event {
  id: number;
  studentId: string;
  event: string;
  description: string;
  score: number;
  source: string;
  priority: "normal" | "warning" | "high";
  timestamp: string;
}

export interface DashboardStats {
  activeStudents: number;
  totalAlerts: number;
  flaggedStudents: number;
  sessionDuration: string;
}

export interface WebSocketMessage {
  type: "event" | "student_update" | "stats_update";
  data: any;
}
