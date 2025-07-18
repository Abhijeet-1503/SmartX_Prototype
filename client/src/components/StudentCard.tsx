import { Video, Circle, AlertTriangle, Flag } from "lucide-react";
import { Student } from "@/types/dashboard";
import { Progress } from "@/components/ui/progress";

interface StudentCardProps {
  student: Student;
}

export default function StudentCard({ student }: StudentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal": return "status-normal";
      case "warning": return "status-warning";
      case "flagged": return "status-flagged";
      default: return "gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "normal": return <Circle className="w-3 h-3 mr-1" />;
      case "warning": return <AlertTriangle className="w-3 h-3 mr-1" />;
      case "flagged": return <Flag className="w-3 h-3 mr-1" />;
      default: return <Circle className="w-3 h-3 mr-1" />;
    }
  };

  const formatLastActivity = (timestamp: string) => {
    const now = new Date();
    const lastActivity = new Date(timestamp);
    const diffMs = now.getTime() - lastActivity.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffSeconds = Math.floor(diffMs / 1000);

    if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    } else {
      return `${diffSeconds}s ago`;
    }
  };

  const borderClass = student.status === "flagged" 
    ? "border-status-flagged student-flagged" 
    : student.status === "warning"
    ? "border-status-warning"
    : "border-gray-700 hover:border-status-normal";

  return (
    <div className={`bg-dark-surface rounded-lg border ${borderClass} overflow-hidden transition-colors`}>
      <div className="relative">
        {/* Simulated Video Feed */}
        <div className="aspect-video bg-gray-800 flex items-center justify-center relative">
          <div className="text-center">
            <Video className="w-8 h-8 text-gray-500 mb-2" />
            <p className="text-sm text-gray-400">Camera Feed</p>
          </div>
          
          {/* Status Indicator */}
          <div className={`absolute top-2 left-2 bg-${getStatusColor(student.status)} text-white px-2 py-1 rounded-full text-xs font-medium flex items-center`}>
            {getStatusIcon(student.status)}
            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
          </div>
          
          {/* AI Confidence Score */}
          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            AI: {student.aiConfidence}%
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{student.name}</h3>
            <span className="text-sm text-gray-400">{student.studentId}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Last Activity:</span>
              <span className={student.status === "flagged" ? "text-status-flagged" : ""}>
                {formatLastActivity(student.lastActivity)}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Alerts:</span>
              <span className={`text-${getStatusColor(student.status)}`}>
                {student.alertCount}
              </span>
            </div>
            
            {/* Behavior Score */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Behavior Score:</span>
                <span className={student.behaviorScore < 60 ? `text-${getStatusColor(student.status)}` : ""}>
                  {student.behaviorScore}%
                </span>
              </div>
              <Progress 
                value={student.behaviorScore} 
                className={`h-2 bg-gray-700`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
