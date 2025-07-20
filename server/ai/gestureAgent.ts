import { storage } from "../storage";
import { insertEventSchema } from "@shared/schema";

export interface GestureDetectionResult {
  handPosition: string;
  bodyPose: string;
  movementLevel: string;
  suspiciousActivity: boolean;
  confidence: number;
  stability: number;
}

export class GestureAgent {
  private isRunning: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private broadcastCallback?: (data: any) => void;

  constructor(broadcastCallback?: (data: any) => void) {
    this.broadcastCallback = broadcastCallback;
    this.startProcessing();
  }

  startProcessing() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log("Gesture Agent: Starting pose and hand tracking...");
    
    // Process gesture detection every 4 seconds (offset from face agent)
    this.processingInterval = setInterval(async () => {
      await this.processStudentGestures();
    }, 4000);
  }

  stopProcessing() {
    this.isRunning = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    console.log("Gesture Agent: Stopped processing");
  }

  private async processStudentGestures() {
    try {
      const students = await storage.getAllStudents();
      
      for (const student of students) {
        const result = await this.analyzeGesture(student.studentId);
        await this.processResult(student.studentId, result);
      }
    } catch (error) {
      console.error("Gesture Agent: Error processing gestures:", error);
    }
  }

  private async analyzeGesture(studentId: string): Promise<GestureDetectionResult> {
    // Simulate Mediapipe Pose/Hands detection
    const handPositions = ["visible_desk", "hidden", "near_face", "writing", "typing", "suspicious_area", "phone_area"];
    const bodyPoses = ["upright", "leaning_forward", "leaning_back", "slouching", "turned_left", "turned_right", "looking_down"];
    const movementLevels = ["minimal", "normal", "high", "excessive"];
    
    const handPosition = handPositions[Math.floor(Math.random() * handPositions.length)];
    const bodyPose = bodyPoses[Math.floor(Math.random() * bodyPoses.length)];
    const movementLevel = movementLevels[Math.floor(Math.random() * movementLevels.length)];
    
    // Determine suspicious activity based on combinations
    const suspiciousActivity = 
      handPosition === "hidden" || 
      handPosition === "suspicious_area" || 
      handPosition === "phone_area" ||
      (movementLevel === "excessive" && bodyPose === "turned_left") ||
      (movementLevel === "excessive" && bodyPose === "turned_right");
    
    // Calculate confidence based on pose clarity and hand visibility
    let confidence = Math.random() * 30 + 70; // Base 70-100%
    if (handPosition === "hidden") confidence *= 0.6;
    if (movementLevel === "excessive") confidence *= 0.8;
    if (bodyPose === "upright" && handPosition === "visible_desk") confidence *= 1.1;
    
    // Calculate stability score
    let stability = 85;
    if (movementLevel === "excessive") stability -= 40;
    if (movementLevel === "high") stability -= 20;
    if (bodyPose === "slouching") stability -= 10;
    if (handPosition === "writing" || handPosition === "typing") stability += 10;
    
    stability = Math.max(0, Math.min(100, stability + (Math.random() - 0.5) * 15));
    confidence = Math.max(30, Math.min(100, confidence));
    
    return {
      handPosition,
      bodyPose,
      movementLevel,
      suspiciousActivity,
      confidence: Math.round(confidence),
      stability: Math.round(stability)
    };
  }

  private async processResult(studentId: string, result: GestureDetectionResult) {
    let event: string;
    let description: string;
    let priority: "normal" | "warning" | "high" = "normal";
    let score = result.stability;

    // Determine event type and priority based on analysis
    if (result.suspiciousActivity) {
      if (result.handPosition === "phone_area") {
        event = "phone_interaction";
        description = "Possible phone interaction detected";
        priority = "high";
        score = 15;
      } else if (result.handPosition === "hidden") {
        event = "hidden_hands";
        description = "Hands not visible - possible cheating";
        priority = "high";
        score = 25;
      } else if (result.handPosition === "suspicious_area") {
        event = "suspicious_movement";
        description = "Hand movement in suspicious area";
        priority = "warning";
        score = 40;
      } else {
        event = "excessive_movement";
        description = "Excessive body movement detected";
        priority = "warning";
        score = 45;
      }
    } else if (result.movementLevel === "excessive") {
      event = "high_movement";
      description = "High level of movement detected";
      priority = "warning";
      score = Math.max(50, score);
    } else if (result.bodyPose === "turned_left" || result.bodyPose === "turned_right") {
      event = `head_turn_${result.bodyPose.split('_')[1]}`;
      description = `Student turned ${result.bodyPose.split('_')[1]}`;
      priority = result.confidence > 75 ? "warning" : "normal";
      score = Math.max(60, score);
    } else if (result.handPosition === "writing" || result.handPosition === "typing") {
      event = "normal_activity";
      description = `Student ${result.handPosition} - normal exam behavior`;
      priority = "normal";
      score = Math.min(100, score + 10);
    } else if (result.bodyPose === "upright" && result.movementLevel === "minimal") {
      event = "focused_posture";
      description = "Student maintaining focused posture";
      priority = "normal";
      score = Math.min(100, score + 5);
    } else {
      event = "normal_behavior";
      description = "Normal posture and hand position";
      priority = "normal";
    }

    try {
      const newEvent = await storage.createEvent({
        studentId,
        event,
        description,
        score,
        source: "ai_gesture_agent",
        priority,
      });

      // Update student status based on findings
      const student = await storage.getStudentByStudentId(studentId);
      if (student) {
        let updates: any = {
          aiConfidence: Math.round((student.aiConfidence + result.confidence) / 2),
        };

        if (priority === "high") {
          updates.status = "flagged";
          updates.behaviorScore = Math.max(15, student.behaviorScore - 20);
          updates.alertCount = student.alertCount + 1;
        } else if (priority === "warning") {
          updates.status = student.status === "normal" ? "warning" : student.status;
          updates.behaviorScore = Math.max(25, student.behaviorScore - 10);
          if (Math.random() > 0.5) updates.alertCount = student.alertCount + 1;
        } else {
          updates.behaviorScore = Math.min(100, student.behaviorScore + 3);
        }

        const updatedStudent = await storage.updateStudent(student.id, updates);

        // Broadcast real-time updates if callback provided
        if (this.broadcastCallback) {
          this.broadcastCallback({
            type: 'event',
            data: newEvent,
          });

          this.broadcastCallback({
            type: 'student_update',
            data: updatedStudent,
          });
        }
      }

    } catch (error) {
      console.error(`Gesture Agent: Failed to process result for ${studentId}:`, error);
    }
  }

  // Public method to get current analysis for a student
  async getCurrentAnalysis(studentId: string): Promise<GestureDetectionResult> {
    return await this.analyzeGesture(studentId);
  }

  // Method to analyze specific gesture patterns
  async analyzeHandGesture(handPosition: string, bodyPose: string): Promise<{ 
    riskLevel: number, 
    description: string 
  }> {
    let riskLevel = 0;
    let description = "Normal behavior";

    if (handPosition === "hidden" || handPosition === "phone_area") {
      riskLevel = 90;
      description = "High risk - potential cheating activity";
    } else if (handPosition === "suspicious_area") {
      riskLevel = 70;
      description = "Medium risk - unusual hand placement";
    } else if (bodyPose === "turned_left" || bodyPose === "turned_right") {
      riskLevel = 50;
      description = "Low risk - looking around";
    } else if (handPosition === "writing" && bodyPose === "upright") {
      riskLevel = 10;
      description = "Low risk - normal exam behavior";
    }

    return { riskLevel, description };
  }
}