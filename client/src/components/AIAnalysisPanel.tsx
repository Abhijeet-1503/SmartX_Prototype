import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, Hand, Brain, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface AIAnalysisData {
  face: {
    emotion: string;
    gazeDirection: string;
    faceVisible: boolean;
    confidence: number;
    attention: number;
  };
  gesture: {
    handPosition: string;
    bodyPose: string;
    movementLevel: string;
    suspiciousActivity: boolean;
    confidence: number;
    stability: number;
  };
  overallRisk: number;
  recommendation: string;
}

interface AIAnalysisPanelProps {
  studentId?: string;
}

export default function AIAnalysisPanel({ studentId }: AIAnalysisPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: analysisData, refetch } = useQuery({
    queryKey: ["/api/ai/student", studentId, "analysis"],
    enabled: !!studentId,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const { data: systemStatus } = useQuery({
    queryKey: ["/api/ai/status"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const handleManualAnalysis = async () => {
    if (!studentId) return;
    
    setIsAnalyzing(true);
    try {
      await fetch(`/api/ai/analyze/${studentId}`, { method: 'POST' });
      await refetch();
    } catch (error) {
      console.error("Failed to trigger analysis:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk > 80) return "status-flagged";
    if (risk > 60) return "status-warning";
    if (risk > 30) return "yellow-500";
    return "status-normal";
  };

  const getEmotionColor = (emotion: string) => {
    const negativeEmotions = ["angry", "frustrated", "confused", "fearful", "sad"];
    const positiveEmotions = ["happy", "neutral"];
    
    if (negativeEmotions.includes(emotion)) return "status-warning";
    if (positiveEmotions.includes(emotion)) return "status-normal";
    return "gray-400";
  };

  if (!studentId) {
    return (
      <div className="bg-dark-surface rounded-lg p-6">
        <div className="text-center text-gray-400">
          <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
          <p>Select a student to view AI analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-surface rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-blue/20 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary-blue" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">AI Analysis</h3>
            <p className="text-sm text-gray-400">Student {studentId}</p>
          </div>
        </div>
        
        <Button
          onClick={handleManualAnalysis}
          disabled={isAnalyzing}
          size="sm"
          className="bg-primary-blue hover:bg-blue-700"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Now"}
        </Button>
      </div>

      {systemStatus && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-dark-surface-variant rounded-lg">
          <div className="text-center">
            <p className="text-xs text-gray-400">System Status</p>
            <Badge variant={systemStatus.isMonitoring ? "default" : "destructive"}>
              {systemStatus.isMonitoring ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Avg Confidence</p>
            <p className="text-sm font-semibold">{systemStatus.averageConfidence}%</p>
          </div>
        </div>
      )}

      {analysisData && (
        <div className="space-y-6">
          {/* Overall Risk Assessment */}
          <div className="bg-dark-surface-variant rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Risk Assessment
              </h4>
              <span className={`text-${getRiskColor(analysisData.overallRisk)} font-bold`}>
                {analysisData.overallRisk}%
              </span>
            </div>
            <Progress 
              value={analysisData.overallRisk} 
              className="h-3 mb-2"
            />
            <p className="text-sm text-gray-300">{analysisData.recommendation}</p>
          </div>

          {/* Face Analysis */}
          <div className="bg-dark-surface-variant rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              Face & Gaze Analysis
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-1">Emotion</p>
                <Badge className={`bg-${getEmotionColor(analysisData.face.emotion)}/20 text-${getEmotionColor(analysisData.face.emotion)}`}>
                  {analysisData.face.emotion}
                </Badge>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Gaze Direction</p>
                <p className="capitalize">{analysisData.face.gazeDirection}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Face Visible</p>
                <Badge variant={analysisData.face.faceVisible ? "default" : "destructive"}>
                  {analysisData.face.faceVisible ? "Yes" : "No"}
                </Badge>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Attention</p>
                <p>{analysisData.face.attention}%</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Confidence</span>
                <span>{analysisData.face.confidence}%</span>
              </div>
              <Progress value={analysisData.face.confidence} className="h-2" />
            </div>
          </div>

          {/* Gesture Analysis */}
          <div className="bg-dark-surface-variant rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center">
              <Hand className="w-4 h-4 mr-2" />
              Gesture & Pose Analysis
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-1">Hand Position</p>
                <p className="capitalize">{analysisData.gesture.handPosition.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Body Pose</p>
                <p className="capitalize">{analysisData.gesture.bodyPose.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Movement Level</p>
                <Badge variant={analysisData.gesture.movementLevel === "excessive" ? "destructive" : "default"}>
                  {analysisData.gesture.movementLevel}
                </Badge>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Suspicious Activity</p>
                <Badge variant={analysisData.gesture.suspiciousActivity ? "destructive" : "default"}>
                  {analysisData.gesture.suspiciousActivity ? "Detected" : "None"}
                </Badge>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Confidence</span>
                  <span>{analysisData.gesture.confidence}%</span>
                </div>
                <Progress value={analysisData.gesture.confidence} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Stability</span>
                  <span>{analysisData.gesture.stability}%</span>
                </div>
                <Progress value={analysisData.gesture.stability} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      )}

      {!analysisData && (
        <div className="text-center text-gray-400 py-8">
          <p>Loading AI analysis...</p>
          <p className="text-sm">Real-time monitoring in progress</p>
        </div>
      )}
    </div>
  );
}