
import { Shield } from "lucide-react";

export const AdminLoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-100 flex items-center justify-center">
      <div className="text-center">
        <Shield className="h-12 w-12 text-red-600 animate-spin mx-auto mb-4" />
        <p className="text-lg text-gray-600">Loading admin dashboard...</p>
      </div>
    </div>
  );
};
