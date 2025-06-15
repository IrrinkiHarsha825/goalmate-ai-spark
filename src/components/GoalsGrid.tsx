
import { GoalCard } from "./GoalCard";
import { GoalTasks } from "./GoalTasks";
import type { Database } from "@/integrations/supabase/types";

type Goal = Database['public']['Tables']['goals']['Row'];

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {goals.map((goal) => (
        <div key={goal.id} className="space-y-4">
          <GoalCard
            goal={goal}
            onView={() => onToggleGoalExpansion(goal.id)}
          />
          
          {expandedGoal === goal.id && (
            <GoalTasks
              goalId={goal.id}
              goalTitle={goal.title}
              goalDescription={goal.description || undefined}
              goalTargetAmount={goal.target_amount ? Number(goal.target_amount) : undefined}
              goalCurrentAmount={goal.current_amount ? Number(goal.current_amount) : 0}
              goalType="general"
              goalStatus="active"
              commitmentAmount={goal.target_amount ? Number(goal.target_amount) : 0}
              onTaskUpdate={onTaskUpdate}
            />
          )}
        </div>
      ))}
    </div>
  );
};
