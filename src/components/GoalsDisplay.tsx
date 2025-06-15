
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { FinancialOverview } from "./FinancialOverview";
import { GoalsGrid } from "./GoalsGrid";
import { EmptyGoalsState } from "./EmptyGoalsState";
import type { Database } from "@/integrations/supabase/types";

type Goal = Database['public']['Tables']['goals']['Row'];

interface GoalsDisplayProps {
  refreshTrigger?: number;
}

export const GoalsDisplay = ({ refreshTrigger }: GoalsDisplayProps) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [tasksRefreshTrigger, setTasksRefreshTrigger] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: "Error",
        description: "Failed to load goals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user, refreshTrigger]);

  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      setGoals(goals.filter(goal => goal.id !== goalId));
      toast({
        title: "Goal Deleted",
        description: "Your goal has been removed",
      });
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
    }
  };

  const toggleGoalExpansion = (goalId: string) => {
    setExpandedGoal(expandedGoal === goalId ? null : goalId);
  };

  const handleTaskUpdate = () => {
    setTasksRefreshTrigger(prev => prev + 1);
    // Refresh goals to get updated progress
    fetchGoals();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center text-gray-600">Loading your goals...</div>
      </div>
    );
  }

  if (goals.length === 0) {
    return <EmptyGoalsState />;
  }

  return (
    <div className="space-y-6">
      <FinancialOverview goals={goals} />
      
      <GoalsGrid
        goals={goals}
        expandedGoal={expandedGoal}
        onToggleGoalExpansion={toggleGoalExpansion}
        onDeleteGoal={deleteGoal}
        onTaskUpdate={handleTaskUpdate}
      />
    </div>
  );
};
