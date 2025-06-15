
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, LogOut } from "lucide-react";

interface AdminNavigationProps {
  userEmail?: string;
  onSignOut: () => void;
}

export const AdminNavigation = ({ userEmail, onSignOut }: AdminNavigationProps) => {
  return (
    <nav className="bg-red-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-white" />
            <span className="text-2xl font-bold text-white">
              Admin Panel
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              Administrator
            </Badge>
            <span className="text-white text-sm">{userEmail}</span>
            <Button
              variant="outline"
              onClick={onSignOut}
              className="border-white text-white hover:bg-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
