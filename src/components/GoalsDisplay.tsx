import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, DollarSign, Target, Trash2, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
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

  const updateGoalProgress = async (goalId: string, newAmount: number) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ current_amount: newAmount })
        .eq('id', goalId);

      if (error) throw error;

      setGoals(goals.map(goal => 
        goal.id === goalId ? { ...goal, current_amount: newAmount } : goal
      ));

      toast({
        title: "Progress Updated!",
        description: `Financial progress has been updated to $${newAmount}`,
      });
    } catch (error) {
      console.error('Error updating goal progress:', error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    }
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString();
  };

  const calculateProgress = (current: number | null, target: number | null) => {
    if (!current || !target) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const toggleGoalExpansion = (goalId: string) => {
    setExpandedGoal(expandedGoal === goalId ? null : goalId);
  };

  const handleTaskUpdate = () => {
    setTasksRefreshTrigger(prev => prev + 1);
  };

  const totalEarned = goals.reduce((sum, goal) => sum + (goal.current_amount || 0), 0);
  const totalTarget = goals.reduce((sum, goal) => sum + (goal.target_amount || 0), 0);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center text-gray-600">Loading your goals...</div>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
        <p className="text-gray-600">Create your first goal to start your journey!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Summary Card */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <TrendingUp className="h-6 w-6 mr-2" />
            Financial Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${totalEarned.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">${totalTarget.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Target</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {totalTarget > 0 ? Math.round((totalEarned / totalTarget) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Overall Progress</div>
            </div>
          </div>
          {totalTarget > 0 && (
            <div className="mt-4">
              <Progress 
                value={totalTarget > 0 ? (totalEarned / totalTarget) * 100 : 0} 
                className="h-3"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Your Goals</h2>
        <Badge variant="outline" className="text-sm">
          {goals.length} {goals.length === 1 ? 'Goal' : 'Goals'}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <div key={goal.id} className="space-y-4">
            <Card className="border-purple-100 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{goal.title}</CardTitle>
                    <Badge className={`mt-2 ${getStatusColor(goal.status)}`}>
                      {goal.status}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleGoalExpansion(goal.id)}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                      {expandedGoal === goal.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGoal(goal.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription className="line-clamp-3">
                  {goal.description}
                </CardDescription>

                {goal.target_amount && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Money Progress
                      </span>
                      <span className="font-semibold text-green-600">
                        ${goal.current_amount || 0} / ${goal.target_amount}
                      </span>
                    </div>
                    <Progress 
                      value={calculateProgress(goal.current_amount, goal.target_amount)} 
                      className="h-2"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const amount = prompt('Enter new progress amount:', (goal.current_amount || 0).toString());
                          if (amount && !isNaN(Number(amount))) {
                            updateGoalProgress(goal.id, Number(amount));
                          }
                        }}
                        className="text-xs"
                      >
                        Update Progress
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Deadline: {formatDate(goal.deadline)}</span>
                </div>

                <div className="text-xs text-gray-500">
                  Created: {formatDate(goal.created_at)}
                </div>
              </CardContent>
            </Card>

            {/* Show tasks when goal is expanded */}
            {expandedGoal === goal.id && (
              <GoalTasks 
                goalId={goal.id} 
                goalTitle={goal.title} 
                onTaskUpdate={handleTaskUpdate}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
