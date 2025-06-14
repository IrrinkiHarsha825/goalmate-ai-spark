
import { Target } from "lucide-react";

export const EmptyGoalsState = () => {
  return (
    <div className="text-center py-12">
      <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
      <p className="text-gray-600">Create your first goal to start your journey!</p>
    </div>
  );
};
