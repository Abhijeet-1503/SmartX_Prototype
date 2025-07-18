import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import TopNavigation from "@/components/TopNavigation";
import DashboardStats from "@/components/DashboardStats";
import StudentGrid from "@/components/StudentGrid";
import EventLogSidebar from "@/components/EventLogSidebar";
import AlertNotifications from "@/components/AlertNotifications";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Student, Event, DashboardStats as StatsType } from "@/types/dashboard";

export default function Dashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<StatsType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("All Events");
  const [alerts, setAlerts] = useState<Event[]>([]);

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

  // Filter students based on search
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <title>SmartProctor-X | Real-Time Monitoring Dashboard</title>
      
      <div className="flex h-screen">
        {/* Main Dashboard Area */}
        <div className="flex-1 flex flex-col">
          <TopNavigation 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isConnected={isConnected}
          />
          
          <DashboardStats stats={stats} />
          
          <StudentGrid students={filteredStudents} />
        </div>

        {/* Event Log Sidebar */}
        <EventLogSidebar 
          events={filteredEvents}
          eventFilter={eventFilter}
          onFilterChange={setEventFilter}
        />
      </div>

      {/* Alert Notifications */}
      <AlertNotifications 
        alerts={alerts}
        onDismiss={dismissAlert}
      />
    </div>
  );
}
