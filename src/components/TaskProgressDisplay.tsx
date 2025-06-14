
import { DollarSign } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Task = Database['public']['Tables']['tasks']['Row'];

interface TaskProgressDisplayProps {
  tasks: Task[];
}

export const TaskProgressDisplay = ({ tasks }: TaskProgressDisplayProps) => {
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const totalPossibleReward = tasks.reduce((sum, task) => sum + (task.reward_amount || 0), 0);
  const totalEarnedReward = tasks.filter(task => task.completed).reduce((sum, task) => sum + (task.reward_amount || 0), 0);

  if (totalTasks === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Task Progress</span>
        <span>{Math.round(progressPercentage)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Financial Progress</span>
        <span className="text-green-600 font-medium">
          ${totalEarnedReward} / ${totalPossibleReward} earned
        </span>
      </div>
    </div>
  );
};
