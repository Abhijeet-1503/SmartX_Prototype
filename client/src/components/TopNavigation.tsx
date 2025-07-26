import { Search, Shield, Download, WifiIcon, User, LogOut, Crown, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

interface TopNavigationProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isConnected: boolean;
  activeTab: "monitoring" | "admin" | "god";
  onTabChange: (tab: "monitoring" | "admin" | "god") => void;
}

export default function TopNavigation({ searchQuery, onSearchChange, isConnected, activeTab, onTabChange }: TopNavigationProps) {
  const { user, logout, isGodMode, isAdmin, isTeacher } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    logout();
    setLocation("/login");
  };

  const handleExport = () => {
    console.log("Exporting logs...");
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case "god": return <Crown className="w-4 h-4 text-yellow-400" />;
      case "admin": return <Shield className="w-4 h-4 text-blue-400" />;
      case "teacher": return <User className="w-4 h-4 text-green-400" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case "god": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "admin": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "teacher": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <header className="glass-card border-b border-slate-700/50 px-6 py-4 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl flex items-center justify-center pulse-glow">
              <Shield className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold neon-text">SmartProctor-X</h1>
              <p className="text-sm text-slate-400">AI-Powered Monitoring System</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as any)} className="w-auto">
            <TabsList className="bg-slate-800/50 border border-slate-700">
              <TabsTrigger value="monitoring" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                Monitoring
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="admin" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </TabsTrigger>
              )}
              {isGodMode && (
                <TabsTrigger value="god" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
                  <Crown className="w-4 h-4 mr-2" />
                  God Mode
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          {activeTab === "monitoring" && (
            <div className="relative">
              <Input
                type="text"
                placeholder="Search students or events..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-slate-800/50 border-slate-600 pl-10 w-80 focus:border-purple-500 focus:ring-purple-500/20 text-white placeholder:text-slate-400"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
          )}
          
          {/* Export Button */}
          {activeTab === "monitoring" && (
            <Button 
              onClick={handleExport}
              className="btn-futuristic"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
          
          {/* Connection Status */}
          <div className="flex items-center space-x-2 glass px-3 py-2 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-sm text-white">{isConnected ? 'Live' : 'Offline'}</span>
            <WifiIcon className="w-4 h-4 text-slate-300" />
          </div>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 hover:bg-slate-800/50">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                    {getRoleIcon()}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">{user?.name}</div>
                    <Badge className={`${getRoleBadgeColor()} text-xs px-2 py-0`}>
                      {user?.role?.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
              <div className="px-3 py-2">
                <p className="text-sm text-white font-medium">{user?.name}</p>
                <p className="text-xs text-slate-400">@{user?.username}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
