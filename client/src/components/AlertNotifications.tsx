import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Event } from "@/types/dashboard";

interface AlertNotificationsProps {
  alerts: Event[];
  onDismiss: (alertId: number) => void;
}

export default function AlertNotifications({ alerts, onDismiss }: AlertNotificationsProps) {
  const [visibleAlerts, setVisibleAlerts] = useState<Event[]>([]);

  useEffect(() => {
    // Only show the 3 most recent alerts
    setVisibleAlerts(alerts.slice(0, 3));
  }, [alerts]);

  // Auto-dismiss alerts after 10 seconds
  useEffect(() => {
    visibleAlerts.forEach((alert) => {
      const timer = setTimeout(() => {
        onDismiss(alert.id);
      }, 10000);

      return () => clearTimeout(timer);
    });
  }, [visibleAlerts, onDismiss]);

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {visibleAlerts.map((alert) => (
        <div
          key={alert.id}
          className="bg-status-flagged text-white px-4 py-3 rounded-lg shadow-lg border border-status-flagged/30 flex items-center space-x-3 animate-pulse alert-enter min-w-80"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-sm">High Priority Alert</p>
            <p className="text-xs opacity-90">
              Student {alert.studentId}: {alert.description}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(alert.id)}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
