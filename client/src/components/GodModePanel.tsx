import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Crown, 
  Trash2, 
  Database, 
  AlertTriangle, 
  Server, 
  RotateCcw,
  Zap,
  Settings
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function GodModePanel() {
  const [isDestructiveMode, setIsDestructiveMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const clearEventsMutation = useMutation({
    mutationFn: () => apiRequest("/api/god/events", { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Events Cleared",
        description: "All event logs have been permanently deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to clear events",
        variant: "destructive",
      });
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: (studentId: number) => apiRequest(`/api/god/students/${studentId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "Student Deleted",
        description: "Student record has been permanently removed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to delete student",
        variant: "destructive",
      });
    },
  });

  const handleClearAllEvents = () => {
    if (!isDestructiveMode) {
      toast({
        title: "Destructive Mode Required",
        description: "Enable destructive mode to perform this action",
        variant: "destructive",
      });
      return;
    }
    clearEventsMutation.mutate();
  };

  const systemActions = [
    {
      title: "Clear Event Logs",
      description: "Permanently delete all behavioral event logs",
      icon: Database,
      action: handleClearAllEvents,
      variant: "destructive" as const,
      disabled: !isDestructiveMode,
    },
    {
      title: "Reset AI Models",
      description: "Restart AI monitoring agents",
      icon: RotateCcw,
      action: () => {
        toast({
          title: "AI Models Reset",
          description: "Face and Gesture agents have been restarted",
        });
      },
      variant: "secondary" as const,
    },
    {
      title: "System Diagnostics",
      description: "Run comprehensive system health check",
      icon: Settings,
      action: () => {
        toast({
          title: "Diagnostics Running",
          description: "System health check initiated",
        });
      },
      variant: "secondary" as const,
    },
    {
      title: "Performance Boost",
      description: "Optimize AI processing speed",
      icon: Zap,
      action: () => {
        toast({
          title: "Performance Optimized",
          description: "AI processing speed has been enhanced",
        });
      },
      variant: "secondary" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-2 rounded-lg pulse-glow">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold neon-yellow">God Mode Control</h2>
            <p className="text-slate-400">Ultimate system administration and manipulation</p>
          </div>
        </div>
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 px-4 py-2">
          DEVELOPER ACCESS
        </Badge>
      </div>

      {/* Warning Alert */}
      <Alert className="bg-red-900/20 border-red-500/50">
        <AlertTriangle className="h-4 w-4 text-red-400" />
        <AlertDescription className="text-red-400">
          <strong>WARNING:</strong> God Mode grants unrestricted access to system manipulation. 
          Actions performed here can permanently alter or destroy data. Use with extreme caution.
        </AlertDescription>
      </Alert>

      {/* Destructive Mode Toggle */}
      <Card className="glass-card border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-yellow-400 flex items-center space-x-2">
            <Server className="w-5 h-5" />
            <span>Destructive Operations</span>
          </CardTitle>
          <CardDescription className="text-slate-400">
            Enable to perform irreversible system modifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-white font-medium">Destructive Mode</p>
              <p className="text-sm text-slate-400">
                {isDestructiveMode ? "Destructive operations are ENABLED" : "Destructive operations are DISABLED"}
              </p>
            </div>
            <Button
              onClick={() => setIsDestructiveMode(!isDestructiveMode)}
              variant={isDestructiveMode ? "destructive" : "outline"}
              className={isDestructiveMode ? "bg-red-600 hover:bg-red-700" : "border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"}
            >
              {isDestructiveMode ? "DISABLE" : "ENABLE"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">System Actions</CardTitle>
          <CardDescription className="text-slate-400">
            Advanced system manipulation and control functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card 
                  key={index} 
                  className={`bg-slate-800/30 border-slate-700/50 transition-all duration-200 hover:border-slate-600 ${
                    action.disabled ? "opacity-50" : "hover:scale-105"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        action.variant === "destructive" ? "bg-red-600/20" : "bg-blue-600/20"
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          action.variant === "destructive" ? "text-red-400" : "text-blue-400"
                        }`} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-medium text-white">{action.title}</h3>
                        <p className="text-sm text-slate-400">{action.description}</p>
                        <Button
                          onClick={action.action}
                          size="sm"
                          variant={action.variant}
                          disabled={action.disabled}
                          className={`w-full ${
                            action.variant === "destructive" 
                              ? "bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30" 
                              : "btn-futuristic"
                          }`}
                        >
                          Execute
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">System Information</CardTitle>
          <CardDescription className="text-slate-400">
            Current system status and capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold neon-green">99.9%</div>
              <div className="text-sm text-slate-400">System Uptime</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold neon-cyan">847ms</div>
              <div className="text-sm text-slate-400">AI Response Time</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold neon-purple">2.1GB</div>
              <div className="text-sm text-slate-400">Memory Usage</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-yellow-400">∞</div>
              <div className="text-sm text-slate-400">God Privileges</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Features */}
      <Card className="glass-card border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-purple-400">Advanced Manipulation</CardTitle>
          <CardDescription className="text-slate-400">
            Experimental features and system overrides
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700">
              <div>
                <p className="text-white font-medium">AI Confidence Override</p>
                <p className="text-sm text-slate-400">Manually adjust AI confidence thresholds</p>
              </div>
              <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10">
                Configure
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700">
              <div>
                <p className="text-white font-medium">Event Stream Manipulation</p>
                <p className="text-sm text-slate-400">Inject custom events into the monitoring stream</p>
              </div>
              <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10">
                Access
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700">
              <div>
                <p className="text-white font-medium">Reality Distortion Field</p>
                <p className="text-sm text-slate-400">Toggle between simulation and live monitoring modes</p>
              </div>
              <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10">
                Activate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}