
import { DollarSign } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Task = Database['public']['Tables']['tasks']['Row'];

interface TaskProgressDisplayProps {
  tasks: Task[];
  goalCurrentAmount?: number;
  goalTargetAmount?: number;
}

export const TaskProgressDisplay = ({ tasks, goalCurrentAmount = 0, goalTargetAmount }: TaskProgressDisplayProps) => {
  const totalTasks = tasks.length;
  const totalPossibleReward = tasks.reduce((sum, task) => sum + (task.reward_amount || 0), 0);
  
  // Use actual goal progress for earned amount
  const totalEarnedReward = goalCurrentAmount;
  
  // Calculate progress percentage based on target amount if available, otherwise use task completion
  const progressPercentage = goalTargetAmount && goalTargetAmount > 0 
    ? Math.min((totalEarnedReward / goalTargetAmount) * 100, 100)
    : 0;

  if (totalTasks === 0 && totalEarnedReward === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Goal Progress</span>
        <span>{Math.round(progressPercentage)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Money Progress</span>
        <span className="text-green-600 font-medium">
          ${totalEarnedReward} {goalTargetAmount ? `/ $${goalTargetAmount}` : ''} earned
        </span>
      </div>
      {totalTasks > 0 && (
        <div className="flex justify-between text-xs text-gray-500">
          <span>Remaining tasks</span>
          <span>${totalPossibleReward} potential</span>
        </div>
      )}
    </div>
  );
};
