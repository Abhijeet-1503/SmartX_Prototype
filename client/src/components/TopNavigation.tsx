import { Search, Shield, Download, WifiIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TopNavigationProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isConnected: boolean;
}

export default function TopNavigation({ searchQuery, onSearchChange, isConnected }: TopNavigationProps) {
  const handleExport = () => {
    // TODO: Implement actual export functionality
    console.log("Exporting logs...");
  };

  return (
    <header className="bg-dark-surface border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-blue rounded-lg flex items-center justify-center">
              <Shield className="text-white w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">SmartProctor-X</h1>
              <p className="text-sm text-gray-400">Real-Time Monitoring Dashboard</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search students or events..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-dark-surface-variant border-gray-600 pl-10 w-80 focus:border-primary-blue"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          
          {/* Controls */}
          <Button 
            onClick={handleExport}
            className="bg-primary-blue hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
          
          <div className="flex items-center space-x-2 bg-dark-surface-variant px-3 py-2 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-status-normal animate-pulse' : 'bg-gray-500'}`} />
            <WifiIcon className="w-4 h-4" />
            <span className="text-sm">{isConnected ? 'Live Monitoring' : 'Disconnected'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
