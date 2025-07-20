import { storage } from "../storage";
import { insertEventSchema } from "@shared/schema";

export interface FaceDetectionResult {
  emotion: string;
  gazeDirection: string;
  faceVisible: boolean;
  confidence: number;
  attention: number;
}

export class FaceAgent {
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
    console.log("Face Agent: Starting emotion and gaze tracking...");
    
    // Process face detection every 3 seconds
    this.processingInterval = setInterval(async () => {
      await this.processStudentFaces();
    }, 3000);
  }

  stopProcessing() {
    this.isRunning = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    console.log("Face Agent: Stopped processing");
  }

  private async processStudentFaces() {
    try {
      const students = await storage.getAllStudents();
      
      for (const student of students) {
        const result = await this.analyzeFace(student.studentId);
        await this.processResult(student.studentId, result);
      }
    } catch (error) {
      console.error("Face Agent: Error processing faces:", error);
    }
  }

  private async analyzeFace(studentId: string): Promise<FaceDetectionResult> {
    // Simulate FER+ emotion detection and gaze tracking
    const emotions = ["neutral", "happy", "sad", "angry", "fearful", "disgusted", "surprised", "confused", "frustrated"];
    const gazeDirections = ["center", "left", "right", "up", "down", "away"];
    
    const emotion = emotions[Math.floor(Math.random() * emotions.length)];
    const gazeDirection = gazeDirections[Math.floor(Math.random() * gazeDirections.length)];
    const faceVisible = Math.random() > 0.1; // 90% face visible
    
    // Calculate confidence based on face visibility and emotion clarity
    let confidence = Math.random() * 40 + 60; // Base 60-100%
    if (!faceVisible) confidence *= 0.3;
    if (emotion === "confused" || emotion === "frustrated") confidence *= 0.8;
    
    // Calculate attention score based on gaze and emotion
    let attention = 80;
    if (gazeDirection === "center") attention += 15;
    if (gazeDirection === "away") attention -= 30;
    if (gazeDirection === "left" || gazeDirection === "right") attention -= 10;
    if (emotion === "frustrated" || emotion === "confused") attention -= 20;
    if (emotion === "happy" || emotion === "neutral") attention += 5;
    
    attention = Math.max(0, Math.min(100, attention + (Math.random() - 0.5) * 20));
    
    return {
      emotion,
      gazeDirection,
      faceVisible,
      confidence: Math.round(confidence),
      attention: Math.round(attention)
    };
  }

  private async processResult(studentId: string, result: FaceDetectionResult) {
    let event: string;
    let description: string;
    let priority: "normal" | "warning" | "high" = "normal";
    let score = result.attention;

    // Determine event type and priority based on analysis
    if (!result.faceVisible) {
      event = "face_not_visible";
      description = "Face not visible for extended period";
      priority = "high";
      score = 20;
    } else if (result.gazeDirection === "away") {
      event = "gaze_away";
      description = "Extended gaze away from screen";
      priority = result.confidence > 70 ? "high" : "warning";
      score = Math.max(30, score);
    } else if (result.gazeDirection === "left" || result.gazeDirection === "right") {
      event = `gaze_${result.gazeDirection}`;
      description = `Gaze directed ${result.gazeDirection}`;
      priority = result.confidence > 80 ? "warning" : "normal";
    } else if (result.emotion === "frustrated" || result.emotion === "confused") {
      event = "emotional_distress";
      description = `Student showing signs of ${result.emotion}`;
      priority = "warning";
      score = Math.max(40, score);
    } else if (result.gazeDirection === "center" && (result.emotion === "neutral" || result.emotion === "happy")) {
      event = "focused_behavior";
      description = "Student appears focused and engaged";
      priority = "normal";
      score = Math.min(100, score + 10);
    } else {
      event = "normal_behavior";
      description = "Normal behavior detected";
      priority = "normal";
    }

    try {
      const newEvent = await storage.createEvent({
        studentId,
        event,
        description,
        score,
        source: "ai_face_agent",
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
          updates.behaviorScore = Math.max(20, student.behaviorScore - 15);
          updates.alertCount = student.alertCount + 1;
        } else if (priority === "warning") {
          updates.status = student.status === "normal" ? "warning" : student.status;
          updates.behaviorScore = Math.max(30, student.behaviorScore - 8);
          if (Math.random() > 0.6) updates.alertCount = student.alertCount + 1;
        } else {
          updates.behaviorScore = Math.min(100, student.behaviorScore + 2);
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
      console.error(`Face Agent: Failed to process result for ${studentId}:`, error);
    }
  }

  // Public method to get current analysis for a student
  async getCurrentAnalysis(studentId: string): Promise<FaceDetectionResult> {
    return await this.analyzeFace(studentId);
  }
}