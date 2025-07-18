import { Users, AlertTriangle, Flag, Clock } from "lucide-react";
import { DashboardStats as StatsType } from "@/types/dashboard";

interface DashboardStatsProps {
  stats: StatsType | null;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  if (!stats) {
    return (
      <div className="px-6 py-4 bg-dark-surface border-b border-gray-700">
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-dark-surface-variant rounded-lg p-4 animate-pulse">
              <div className="h-16 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 bg-dark-surface border-b border-gray-700">
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-dark-surface-variant rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Students</p>
              <p className="text-2xl font-semibold">{stats.activeStudents}</p>
            </div>
            <div className="w-10 h-10 bg-status-normal/20 rounded-lg flex items-center justify-center">
              <Users className="text-status-normal w-5 h-5" />
            </div>
          </div>
        </div>
        
        <div className="bg-dark-surface-variant rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Alerts</p>
              <p className="text-2xl font-semibold">{stats.totalAlerts}</p>
            </div>
            <div className="w-10 h-10 bg-status-warning/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-status-warning w-5 h-5" />
            </div>
          </div>
        </div>
        
        <div className="bg-dark-surface-variant rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Flagged Students</p>
              <p className="text-2xl font-semibold text-status-flagged">{stats.flaggedStudents}</p>
            </div>
            <div className="w-10 h-10 bg-status-flagged/20 rounded-lg flex items-center justify-center">
              <Flag className="text-status-flagged w-5 h-5" />
            </div>
          </div>
        </div>
        
        <div className="bg-dark-surface-variant rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Session Duration</p>
              <p className="text-2xl font-semibold">{stats.sessionDuration}</p>
            </div>
            <div className="w-10 h-10 bg-primary-blue/20 rounded-lg flex items-center justify-center">
              <Clock className="text-primary-blue w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
