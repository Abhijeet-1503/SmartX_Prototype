import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertEventSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  app.get("/api/students", async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/events", async (req, res) => {
    try {
      const { studentId, limit } = req.query;
      let events;
      
      if (studentId) {
        events = await storage.getEventsByStudentId(studentId as string);
      } else {
        events = await storage.getRecentEvents(limit ? parseInt(limit as string) : 50);
      }
      
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      
      // Update student alert count and status if needed
      const student = await storage.getStudentByStudentId(eventData.studentId);
      if (student) {
        let updates: any = { alertCount: student.alertCount + 1 };
        
        if (eventData.priority === "high") {
          updates.status = "flagged";
          updates.behaviorScore = Math.max(0, student.behaviorScore - 10);
        } else if (eventData.priority === "warning") {
          updates.status = student.status === "normal" ? "warning" : student.status;
          updates.behaviorScore = Math.max(0, student.behaviorScore - 5);
        }
        
        await storage.updateStudent(student.id, updates);
      }
      
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: "Failed to create event" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket Server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected to WebSocket');

    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected from WebSocket');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Broadcast function for real-time updates
  function broadcast(data: any) {
    const message = JSON.stringify(data);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Simulate real-time AI events
  setInterval(async () => {
    const students = await storage.getAllStudents();
    if (students.length === 0) return;

    const randomStudent = students[Math.floor(Math.random() * students.length)];
    const events = [
      "gaze_left", "gaze_right", "gaze_away", "face_not_visible", 
      "suspicious_movement", "normal_behavior", "focused_behavior",
      "hand_movement", "head_turn", "eye_tracking_lost"
    ];
    
    const sources = ["ai_face_agent", "ai_gesture_agent"];
    const event = events[Math.floor(Math.random() * events.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    
    let priority = "normal";
    let description = "Normal behavior detected";
    let score = Math.floor(Math.random() * 20) + 80; // 80-100
    
    if (event.includes("away") || event.includes("not_visible") || event.includes("suspicious")) {
      priority = Math.random() > 0.5 ? "high" : "warning";
      score = Math.floor(Math.random() * 40) + 30; // 30-70
      
      if (event === "face_not_visible") {
        description = "Face not visible for extended period";
      } else if (event === "gaze_away") {
        description = "Extended gaze away from screen";
      } else if (event === "suspicious_movement") {
        description = "Suspicious hand movement";
      } else {
        description = "Multiple gaze movements detected";
      }
    } else if (event.includes("focused") || event.includes("normal")) {
      description = event.includes("focused") ? "Focused behavior confirmed" : "Normal behavior detected";
    } else {
      priority = "warning";
      score = Math.floor(Math.random() * 30) + 50; // 50-80
      description = `${event.replace(/_/g, ' ')} detected`;
    }

    try {
      const newEvent = await storage.createEvent({
        studentId: randomStudent.studentId,
        event,
        description,
        score,
        source,
        priority,
      });

      // Update student based on event
      let statusUpdate: any = {};
      if (priority === "high") {
        statusUpdate = {
          status: "flagged",
          behaviorScore: Math.max(30, randomStudent.behaviorScore - Math.floor(Math.random() * 10) - 5),
          alertCount: randomStudent.alertCount + 1,
          aiConfidence: Math.max(30, score),
        };
      } else if (priority === "warning") {
        statusUpdate = {
          status: randomStudent.status === "normal" ? "warning" : randomStudent.status,
          behaviorScore: Math.max(40, randomStudent.behaviorScore - Math.floor(Math.random() * 5) - 2),
          alertCount: randomStudent.alertCount + (Math.random() > 0.5 ? 1 : 0),
          aiConfidence: Math.max(50, score),
        };
      } else {
        statusUpdate = {
          behaviorScore: Math.min(100, randomStudent.behaviorScore + Math.floor(Math.random() * 3)),
          aiConfidence: Math.min(100, score),
        };
      }

      const updatedStudent = await storage.updateStudent(randomStudent.id, statusUpdate);

      // Broadcast updates
      broadcast({
        type: 'event',
        data: newEvent,
      });

      broadcast({
        type: 'student_update',
        data: updatedStudent,
      });

      // Send stats update
      const stats = await storage.getDashboardStats();
      broadcast({
        type: 'stats_update',
        data: stats,
      });

    } catch (error) {
      console.error('Error creating simulated event:', error);
    }
  }, 2000); // Every 2 seconds

  return httpServer;
}
