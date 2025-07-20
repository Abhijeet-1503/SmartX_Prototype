import { FaceAgent } from "./faceAgent";
import { GestureAgent } from "./gestureAgent";
import { storage } from "../storage";

export class AIManager {
  private faceAgent: FaceAgent | null = null;
  private gestureAgent: GestureAgent | null = null;
  private isMonitoring: boolean = false;
  private broadcastCallback?: (data: any) => void;

  constructor() {
    // Agents will be initialized when monitoring starts
  }

  setBroadcastCallback(callback: (data: any) => void) {
    this.broadcastCallback = callback;
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log("AI Manager: Starting comprehensive monitoring...");
    
    // Initialize agents with broadcast callback
    this.faceAgent = new FaceAgent(this.broadcastCallback);
    this.gestureAgent = new GestureAgent(this.broadcastCallback);
  }

  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    console.log("AI Manager: Stopping all monitoring...");
    
    if (this.faceAgent) {
      this.faceAgent.stopProcessing();
      this.faceAgent = null;
    }
    if (this.gestureAgent) {
      this.gestureAgent.stopProcessing();
      this.gestureAgent = null;
    }
  }

  async getStudentAnalysis(studentId: string) {
    if (!this.faceAgent || !this.gestureAgent) {
      throw new Error("AI agents not initialized - monitoring not started");
    }
    
    const [faceAnalysis, gestureAnalysis] = await Promise.all([
      this.faceAgent.getCurrentAnalysis(studentId),
      this.gestureAgent.getCurrentAnalysis(studentId)
    ]);

    // Calculate combined risk assessment
    const overallRisk = this.calculateOverallRisk(faceAnalysis, gestureAnalysis);
    
    return {
      face: faceAnalysis,
      gesture: gestureAnalysis,
      overallRisk,
      recommendation: this.getRecommendation(overallRisk)
    };
  }

  private calculateOverallRisk(faceResult: any, gestureResult: any): number {
    let risk = 0;
    
    // Face-based risk factors
    if (!faceResult.faceVisible) risk += 40;
    if (faceResult.gazeDirection === "away") risk += 30;
    if (faceResult.emotion === "frustrated" || faceResult.emotion === "confused") risk += 15;
    if (faceResult.attention < 50) risk += 20;
    
    // Gesture-based risk factors
    if (gestureResult.suspiciousActivity) risk += 35;
    if (gestureResult.handPosition === "hidden") risk += 30;
    if (gestureResult.movementLevel === "excessive") risk += 20;
    if (gestureResult.stability < 40) risk += 15;
    
    // Confidence adjustments
    const avgConfidence = (faceResult.confidence + gestureResult.confidence) / 2;
    if (avgConfidence < 60) risk *= 0.7; // Reduce risk if low confidence
    
    return Math.min(100, Math.max(0, risk));
  }

  private getRecommendation(riskLevel: number): string {
    if (riskLevel > 80) {
      return "Immediate intervention required - High suspicion of cheating";
    } else if (riskLevel > 60) {
      return "Close monitoring recommended - Suspicious behavior detected";
    } else if (riskLevel > 40) {
      return "Increased attention advised - Some concerning indicators";
    } else if (riskLevel > 20) {
      return "Normal monitoring - Minor irregularities noted";
    } else {
      return "Continue normal monitoring - No significant concerns";
    }
  }

  async getSystemStatus() {
    const students = await storage.getAllStudents();
    const recentEvents = await storage.getRecentEvents(20);
    
    const activeAlerts = recentEvents.filter(e => e.priority === "high").length;
    const warningAlerts = recentEvents.filter(e => e.priority === "warning").length;
    
    return {
      isMonitoring: this.isMonitoring,
      totalStudents: students.length,
      activeStudents: students.filter(s => s.isActive).length,
      flaggedStudents: students.filter(s => s.status === "flagged").length,
      warningStudents: students.filter(s => s.status === "warning").length,
      recentHighAlerts: activeAlerts,
      recentWarningAlerts: warningAlerts,
      averageBehaviorScore: Math.round(
        students.reduce((sum, s) => sum + s.behaviorScore, 0) / students.length
      ),
      averageConfidence: Math.round(
        students.reduce((sum, s) => sum + s.aiConfidence, 0) / students.length
      )
    };
  }

  // Method to manually trigger analysis for specific student
  async analyzeStudent(studentId: string) {
    console.log(`AI Manager: Manual analysis triggered for ${studentId}`);
    return await this.getStudentAnalysis(studentId);
  }

  // Method to update AI sensitivity settings
  updateSensitivity(faceThreshold: number, gestureThreshold: number) {
    // In a real implementation, this would adjust detection thresholds
    console.log(`AI Manager: Updated sensitivity - Face: ${faceThreshold}%, Gesture: ${gestureThreshold}%`);
  }
}

// Export singleton instance
export const aiManager = new AIManager();