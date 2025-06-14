import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TaskCreationControls } from "./TaskCreationControls";
import { TaskList } from "./TaskList";
import { TaskProgressDisplay } from "./TaskProgressDisplay";
import type { Database } from "@/integrations/supabase/types";

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];

interface GoalTasksProps {
  goalId: string;
  goalTitle: string;
  goalDescription?: string;
  goalTargetAmount?: number;
  onTaskUpdate?: () => void;
}

export const GoalTasks = ({ goalId, goalTitle, goalDescription, goalTargetAmount, onTaskUpdate }: GoalTasksProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const { toast } = useToast();

  // Difficulty weights for percentage distribution
  const difficultyWeights = {
    easy: 1,
    medium: 2,
    hard: 3
  };

  const calculateTaskReward = (difficulty: 'easy' | 'medium' | 'hard', totalTasks: number, targetAmount: number) => {
    if (!targetAmount || totalTasks === 0) {
      // Fallback to fixed amounts if no target amount
      const fallbackRewards = { easy: 10, medium: 25, hard: 50 };
      return fallbackRewards[difficulty];
    }

    // Calculate total weight points for all tasks
    const easyCount = tasks.filter(t => t.difficulty === 'easy').length + (difficulty === 'easy' ? 1 : 0);
    const mediumCount = tasks.filter(t => t.difficulty === 'medium').length + (difficulty === 'medium' ? 1 : 0);
    const hardCount = tasks.filter(t => t.difficulty === 'hard').length + (difficulty === 'hard' ? 1 : 0);
    
    const totalWeightPoints = (easyCount * difficultyWeights.easy) + 
                              (mediumCount * difficultyWeights.medium) + 
                              (hardCount * difficultyWeights.hard);

    // Calculate reward based on difficulty weight and target amount
    const difficultyWeight = difficultyWeights[difficulty];
    const rewardAmount = Math.round((difficultyWeight / totalWeightPoints) * targetAmount);
    
    return Math.max(rewardAmount, 1); // Minimum $1 per task
  };

  const recalculateAllTaskRewards = async (currentTasks: Task[]) => {
    if (!goalTargetAmount || currentTasks.length === 0) return;

    try {
      // Calculate new rewards for all tasks
      const updatedTasks: Task[] = [];
      
      for (const task of currentTasks) {
        const newReward = calculateTaskReward(
          task.difficulty as 'easy' | 'medium' | 'hard', 
          currentTasks.length, 
          goalTargetAmount
        );

        const { data, error } = await supabase
          .from('tasks')
          .update({ reward_amount: newReward })
          .eq('id', task.id)
          .select()
          .single();

        if (error) throw error;
        updatedTasks.push(data);
      }

      setTasks(updatedTasks);
      await updateGoalProgress(updatedTasks);
    } catch (error) {
      console.error('Error recalculating task rewards:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('goal_id', goalId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
      
      // Recalculate rewards based on current target amount
      if (data && data.length > 0 && goalTargetAmount) {
        await recalculateAllTaskRewards(data);
      } else if (data && data.length > 0) {
        await updateGoalProgress(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [goalId, goalTargetAmount]);

  const updateGoalProgress = async (currentTasks = tasks) => {
    try {
      // Calculate total earned from completed tasks
      const completedTasks = currentTasks.filter(task => task.completed);
      const totalEarned = completedTasks.reduce((sum, task) => sum + (task.reward_amount || 0), 0);

      console.log(`Updating goal ${goalId} progress to $${totalEarned}`);

      const { error } = await supabase
        .from('goals')
        .update({ current_amount: totalEarned })
        .eq('id', goalId);

      if (error) throw error;

      onTaskUpdate?.();
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  const generateAITasks = async () => {
    setAiLoading(true);
    try {
      const aiGeneratedTasks = [
        { title: `Research and plan approach for: ${goalTitle}`, difficulty: 'easy' as const },
        { title: `Break down ${goalTitle} into smaller milestones`, difficulty: 'medium' as const },
        { title: `Set up necessary resources and tools`, difficulty: 'medium' as const },
        { title: `Create weekly progress checkpoints`, difficulty: 'easy' as const },
        { title: `Execute first phase of ${goalTitle}`, difficulty: 'hard' as const },
        { title: `Review and adjust strategy if needed`, difficulty: 'medium' as const },
        { title: `Complete final implementation`, difficulty: 'hard' as const },
        { title: `Evaluate results and document learnings`, difficulty: 'easy' as const }
      ];

      const newTasks: Task[] = [];
      const totalTasksAfterAdd = tasks.length + aiGeneratedTasks.length;

      // Add each AI-generated task to the database
      for (const task of aiGeneratedTasks) {
        const rewardAmount = calculateTaskReward(task.difficulty, totalTasksAfterAdd, goalTargetAmount || 0);
        const taskData: TaskInsert = {
          goal_id: goalId,
          title: task.title,
          difficulty: task.difficulty,
          reward_amount: rewardAmount,
          completed: false
        };

        const { data, error } = await supabase
          .from('tasks')
          .insert(taskData)
          .select()
          .single();

        if (error) throw error;
        newTasks.push(data);
      }

      const updatedTasks = [...tasks, ...newTasks];
      setTasks(updatedTasks);
      
      // Recalculate all task rewards with new distribution
      if (goalTargetAmount) {
        await recalculateAllTaskRewards(updatedTasks);
      } else {
        await updateGoalProgress(updatedTasks);
      }

      toast({
        title: "AI Tasks Generated",
        description: `Generated ${aiGeneratedTasks.length} tasks with distributed rewards`,
      });
    } catch (error) {
      console.error('Error generating AI tasks:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI tasks",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const addManualTask = async (title: string, difficulty: 'easy' | 'medium' | 'hard') => {
    setLoading(true);
    try {
      const totalTasksAfterAdd = tasks.length + 1;
      const rewardAmount = calculateTaskReward(difficulty, totalTasksAfterAdd, goalTargetAmount || 0);
      
      const taskData: TaskInsert = {
        goal_id: goalId,
        title,
        difficulty,
        reward_amount: rewardAmount,
        completed: false
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) throw error;

      const updatedTasks = [...tasks, data];
      setTasks(updatedTasks);
      
      // Recalculate all task rewards with new distribution
      if (goalTargetAmount) {
        await recalculateAllTaskRewards(updatedTasks);
      } else {
        await updateGoalProgress(updatedTasks);
      }
      
      toast({
        title: "Task Added",
        description: `Task added with $${rewardAmount} reward (distributed from goal target)`,
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      if (completed) {
        // When completing a task, delete it from database and add reward to goal
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId);

        if (error) throw error;

        // Update local state by removing the completed task
        const updatedTasks = tasks.filter(task => task.id !== taskId);
        setTasks(updatedTasks);

        // Add the reward amount to the goal's current amount
        const rewardAmount = task.reward_amount || 0;
        const { data: goalData, error: goalError } = await supabase
          .from('goals')
          .select('current_amount')
          .eq('id', goalId)
          .single();

        if (goalError) throw goalError;

        const newCurrentAmount = (goalData.current_amount || 0) + rewardAmount;

        const { error: updateError } = await supabase
          .from('goals')
          .update({ current_amount: newCurrentAmount })
          .eq('id', goalId);

        if (updateError) throw updateError;

        // Recalculate rewards for remaining tasks
        if (goalTargetAmount && updatedTasks.length > 0) {
          await recalculateAllTaskRewards(updatedTasks);
        }

        onTaskUpdate?.();

        toast({
          title: "Task Completed!",
          description: `Great progress! You earned $${rewardAmount} and the task has been removed`,
        });
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      
      // Recalculate remaining task rewards after deletion
      if (goalTargetAmount && updatedTasks.length > 0) {
        await recalculateAllTaskRewards(updatedTasks);
      } else {
        await updateGoalProgress(updatedTasks);
      }
      
      toast({
        title: "Task Deleted",
        description: "Task removed and rewards redistributed",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const clearAllTasks = async () => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('goal_id', goalId);

      if (error) throw error;

      setTasks([]);
      
      // Reset goal progress to 0
      await supabase
        .from('goals')
        .update({ current_amount: 0 })
        .eq('id', goalId);
      
      onTaskUpdate?.();
      toast({
        title: "All Tasks Cleared",
        description: "All tasks and progress have been reset",
      });
    } catch (error) {
      console.error('Error clearing tasks:', error);
      toast({
        title: "Error",
        description: "Failed to clear tasks",
        variant: "destructive",
      });
    }
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const totalPossibleReward = tasks.reduce((sum, task) => sum + (task.reward_amount || 0), 0);
  const totalEarnedReward = tasks.filter(task => task.completed).reduce((sum, task) => sum + (task.reward_amount || 0), 0);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Tasks for "{goalTitle}"</span>
          <div className="flex items-center gap-4 text-sm font-normal">
            <span className="text-gray-600">
              {completedTasks}/{totalTasks} completed ({Math.round(progressPercentage)}%)
            </span>
            <span className="text-green-600 flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              ${totalEarnedReward} / ${totalPossibleReward}
            </span>
          </div>
        </CardTitle>
        {goalTargetAmount && (
          <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
            💡 Task rewards are automatically distributed from your ${goalTargetAmount} goal target based on difficulty
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <TaskCreationControls
          tasksExist={tasks.length > 0}
          onGenerateAI={generateAITasks}
          onAddManual={addManualTask}
          onClearAll={clearAllTasks}
          aiLoading={aiLoading}
          loading={loading}
        />

        <TaskList
          tasks={tasks}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
        />

        <TaskProgressDisplay tasks={tasks} />
      </CardContent>
    </Card>
  );
};
