import { Filter, Clock, Flag, AlertTriangle, Info, CheckCircle, Hand } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Event } from "@/types/dashboard";

interface EventLogSidebarProps {
  events: Event[];
  eventFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function EventLogSidebar({ events, eventFilter, onFilterChange }: EventLogSidebarProps) {
  const getEventIcon = (event: Event) => {
    if (event.priority === "high") {
      return <Flag className="text-status-flagged w-4 h-4" />;
    } else if (event.priority === "warning") {
      return <AlertTriangle className="text-status-warning w-4 h-4" />;
    } else if (event.event.includes("normal") || event.event.includes("focused")) {
      return <CheckCircle className="text-status-normal w-4 h-4" />;
    } else if (event.event.includes("hand") || event.event.includes("movement")) {
      return <Hand className="text-primary-blue w-4 h-4" />;
    } else {
      return <Info className="text-primary-blue w-4 h-4" />;
    }
  };

  const getEventBorderClass = (priority: string) => {
    switch (priority) {
      case "high": return "bg-status-flagged/10 border-status-flagged/30";
      case "warning": return "bg-status-warning/10 border-status-warning/30";
      default: return "bg-dark-surface-variant border-gray-600";
    }
  };

  const getEventTextClass = (priority: string) => {
    switch (priority) {
      case "high": return "text-status-flagged";
      case "warning": return "text-status-warning";
      default: return "";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="w-96 bg-dark-surface border-l border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Real-Time Event Log</h2>
        
        {/* Filter Controls */}
        <div className="space-y-3">
          <Select value={eventFilter} onValueChange={onFilterChange}>
            <SelectTrigger className="w-full bg-dark-surface-variant border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-dark-surface-variant border-gray-600">
              <SelectItem value="All Events">All Events</SelectItem>
              <SelectItem value="Gaze Events">Gaze Events</SelectItem>
              <SelectItem value="Movement Events">Movement Events</SelectItem>
              <SelectItem value="High Priority">High Priority</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-dark-surface-variant hover:bg-gray-600 border-gray-600"
            >
              <Clock className="w-4 h-4 mr-2" />
              Last Hour
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-primary-blue hover:bg-blue-700"
            >
              Live
            </Button>
          </div>
        </div>
      </div>
      
      {/* Event Log */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {events.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>No events to display</p>
            <p className="text-sm">Events will appear here as they occur</p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className={`rounded-lg p-3 border ${getEventBorderClass(event.priority)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getEventIcon(event)}
                  <span className="font-medium text-sm">{event.studentId}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {formatTimestamp(event.timestamp)}
                </span>
              </div>
              <p className={`text-sm mb-1 ${getEventTextClass(event.priority)}`}>
                {event.description}
              </p>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">{event.source}</span>
                <span className={`font-medium ${getEventTextClass(event.priority)}`}>
                  Score: {(event.score / 100).toFixed(1)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
