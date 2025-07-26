import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardStats from "@/components/DashboardStats";
import StudentGrid from "@/components/StudentGrid";
import StudentCard from "@/components/StudentCard";
import EventLogSidebar from "@/components/EventLogSidebar";
import AlertNotifications from "@/components/AlertNotifications";
import AIAnalysisPanel from "@/components/AIAnalysisPanel";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Student, Event, DashboardStats as StatsType } from "@/types/dashboard";

export default function Dashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<StatsType | null>(null);
  const [eventFilter, setEventFilter] = useState("All Events");
  const [alerts, setAlerts] = useState<Event[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"monitoring">("monitoring");

  const { isConnected, lastMessage } = useWebSocket();

  // Fetch initial data
  const { data: initialStudents } = useQuery({
    queryKey: ["/api/students"],
    enabled: students.length === 0,
  });

  const { data: initialEvents } = useQuery({
    queryKey: ["/api/events"],
    enabled: events.length === 0,
  });

  const { data: initialStats } = useQuery({
    queryKey: ["/api/stats"],
    enabled: !stats,
  });

  // Set initial data
  useEffect(() => {
    if (initialStudents) setStudents(initialStudents);
  }, [initialStudents]);

  useEffect(() => {
    if (initialEvents) setEvents(initialEvents);
  }, [initialEvents]);

  useEffect(() => {
    if (initialStats) setStats(initialStats);
  }, [initialStats]);

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case "event":
        setEvents(prev => [lastMessage.data, ...prev].slice(0, 100)); // Keep last 100 events
        
        // Add to alerts if high priority
        if (lastMessage.data.priority === "high") {
          setAlerts(prev => [lastMessage.data, ...prev]);
          
          // Play sound notification
          try {
            const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Dy");
            audio.volume = 0.3;
            audio.play().catch(() => {}); // Ignore errors in case user hasn't interacted with page
          } catch (error) {
            // Silently fail if audio not supported
          }
        }
        break;

      case "student_update":
        setStudents(prev => prev.map(student => 
          student.id === lastMessage.data.id ? lastMessage.data : student
        ));
        break;

      case "stats_update":
        setStats(lastMessage.data);
        break;
    }
  }, [lastMessage]);

  // Display all students
  const filteredStudents = students;

  // Filter events
  const filteredEvents = events.filter(event => {
    if (eventFilter === "All Events") return true;
    if (eventFilter === "Gaze Events") return event.event.includes("gaze");
    if (eventFilter === "Movement Events") return event.event.includes("movement") || event.event.includes("hand");
    if (eventFilter === "High Priority") return event.priority === "high";
    return true;
  });

  const dismissAlert = (alertId: number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const renderContent = () => {
    return (
      <div className="flex-1 flex overflow-hidden">
        {/* Student Grid */}
        <div className="flex-1 p-6 overflow-auto custom-scrollbar">
          <div className="grid grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
                  <div 
                    key={student.id} 
                    onClick={() => setSelectedStudentId(student.studentId)}
                    className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                      selectedStudentId === student.studentId ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/20' : ''
                    }`}
                  >
                    <StudentCard student={student} />
                  </div>
                ))}
              </div>
            </div>
            
            {/* AI Analysis Panel */}
            <div className="w-96 p-6 border-l border-slate-700">
              <AIAnalysisPanel studentId={selectedStudentId || undefined} />
            </div>
          </div>
        );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white">
      <title>SmartProctor-X | AI-Powered Monitoring Dashboard</title>
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Main Dashboard Area */}
        <div className="flex-1 flex flex-col">
          
          {activeTab === "monitoring" && <DashboardStats stats={stats} />}
          
          {activeTab === "monitoring" || activeTab === "admin" || activeTab === "god" ? (
            <div className="flex-1 overflow-hidden">
              {activeTab === "monitoring" ? (
                <div className="flex h-full">
                  {renderContent()}
                </div>
              ) : (
                <div className="p-6 h-full overflow-auto custom-scrollbar">
                  {renderContent()}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Event Log Sidebar - Only show in monitoring mode */}
        {activeTab === "monitoring" && (
          <EventLogSidebar 
            events={filteredEvents}
            eventFilter={eventFilter}
            onFilterChange={setEventFilter}
          />
        )}
      </div>

      {/* Alert Notifications - Only show in monitoring mode */}
      {activeTab === "monitoring" && (
        <AlertNotifications 
          alerts={alerts}
          onDismiss={dismissAlert}
        />
      )}
    </div>
  );
}
