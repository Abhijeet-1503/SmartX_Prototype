import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertEventSchema, insertUserSchema } from "@shared/schema";
import { aiManager } from "./ai/aiManager";

export async function registerRoutes(app: Express): Promise<Server> {

  // Authentication Routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log("Login attempt:", { username });
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      console.log("User found:", { found: !!user, isActive: user?.isActive });
      
      if (!user || user.password !== password || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      console.log("Login successful for user:", userWithoutPassword);
      res.json({ 
        success: true, 
        user: userWithoutPassword,
        token: `auth-${user.id}-${Date.now()}` // Simple token for demo
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    res.json({ success: true, message: "Logged out successfully" });
  });

  app.get("/api/auth/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No authorization header" });
    }

    // Simple token validation for demo
    const token = authHeader.replace('Bearer ', '');
    const userId = token.split('-')[1];
    
    if (!userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    try {
      const user = await storage.getUser(parseInt(userId));
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  });

  // Admin Routes (for user management)
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid user data", errors: result.error.errors });
      }

      const newUser = await storage.createUser(result.data);
      const { password: _, ...userWithoutPassword } = newUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // God Mode Routes (for system manipulation)
  app.delete("/api/god/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteStudent(id);
      res.json({ success, message: success ? "Student deleted" : "Student not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  app.delete("/api/god/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEvent(id);
      res.json({ success, message: success ? "Event deleted" : "Event not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  app.delete("/api/god/events", async (req, res) => {
    try {
      const success = await storage.clearAllEvents();
      res.json({ success, message: "All events cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear events" });
    }
  });

  // Student Routes
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

  // AI Analysis endpoints
  app.get("/api/ai/student/:studentId/analysis", async (req, res) => {
    try {
      const { studentId } = req.params;
      const analysis = await aiManager.getStudentAnalysis(studentId);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Failed to get student analysis" });
    }
  });

  app.get("/api/ai/status", async (req, res) => {
    try {
      const status = await aiManager.getSystemStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to get AI system status" });
    }
  });

  app.post("/api/ai/analyze/:studentId", async (req, res) => {
    try {
      const { studentId } = req.params;
      const analysis = await aiManager.analyzeStudent(studentId);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze student" });
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

  // Connect AI manager to broadcast system and start monitoring
  aiManager.setBroadcastCallback(broadcast);
  aiManager.startMonitoring();

  // Broadcast real-time updates from AI agents
  const broadcastUpdates = setInterval(async () => {
    try {
      const stats = await storage.getDashboardStats();
      broadcast({
        type: 'stats_update',
        data: stats,
      });
    } catch (error) {
      console.error('Error broadcasting stats update:', error);
    }
  }, 5000); // Every 5 seconds

  return httpServer;
}
