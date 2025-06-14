
import { Badge } from "@/components/ui/badge";
import { GoalCard } from "./GoalCard";
import { GoalTasks } from "./GoalTasks";

interface Goal {
  id: string;
  title: string;
  description: string;
  target_amount: number | null;
  current_amount: number | null;
  deadline: string | null;
  status: string;
  created_at: string;
}

interface GoalsGridProps {
  goals: Goal[];
  expandedGoal: string | null;
  onToggleGoalExpansion: (goalId: string) => void;
  onDeleteGoal: (goalId: string) => void;
  onTaskUpdate: () => void;
}

export const GoalsGrid = ({ 
  goals, 
  expandedGoal, 
  onToggleGoalExpansion, 
  onDeleteGoal, 
  onTaskUpdate 
}: GoalsGridProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Your Goals</h2>
        <Badge variant="outline" className="text-sm">
          {goals.length} {goals.length === 1 ? 'Goal' : 'Goals'}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <div key={goal.id} className="space-y-4">
            <GoalCard
              goal={goal}
              isExpanded={expandedGoal === goal.id}
              onToggleExpansion={onToggleGoalExpansion}
              onDelete={onDeleteGoal}
            />

            {/* Show tasks when goal is expanded */}
            {expandedGoal === goal.id && (
              <GoalTasks 
                goalId={goal.id} 
                goalTitle={goal.title}
                goalTargetAmount={goal.target_amount || undefined}
                onTaskUpdate={onTaskUpdate}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
