
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
  onTaskUpdate?: () => void;
}

export const GoalTasks = ({ goalId, goalTitle, goalDescription, onTaskUpdate }: GoalTasksProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const { toast } = useToast();

  // Reward amounts based on difficulty
  const difficultyRewards = {
    easy: 10,
    medium: 25,
    hard: 50
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
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [goalId]);

  const updateGoalProgress = async () => {
    try {
      // Calculate total earned from completed tasks
      const completedTasks = tasks.filter(task => task.completed);
      const totalEarned = completedTasks.reduce((sum, task) => sum + (task.reward_amount || 0), 0);

      const { error } = await supabase
        .from('goals')
        .update({ current_amount: totalEarned })
        .eq('id', goalId);

      if (error) throw error;

      console.log(`Updated goal progress to $${totalEarned}`);
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

      // Add each AI-generated task to the database
      for (const task of aiGeneratedTasks) {
        const rewardAmount = difficultyRewards[task.difficulty];
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
        setTasks(prev => [...prev, data]);
      }

      onTaskUpdate?.();
      toast({
        title: "AI Tasks Generated",
        description: `Generated ${aiGeneratedTasks.length} tasks with automatic rewards`,
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
      const rewardAmount = difficultyRewards[difficulty];
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

      setTasks([...tasks, data]);
      onTaskUpdate?.();
      toast({
        title: "Task Added",
        description: `Task added with $${rewardAmount} reward`,
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
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      ));

      // Automatically update goal progress after task completion
      setTimeout(() => {
        updateGoalProgress();
      }, 100);

      const task = tasks.find(t => t.id === taskId);
      const rewardAmount = task?.reward_amount || 0;

      toast({
        title: completed ? "Task Completed!" : "Task Unchecked",
        description: completed 
          ? `Great progress! You earned $${rewardAmount}` 
          : `Task marked as incomplete. $${rewardAmount} removed from progress`,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
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

      setTasks(tasks.filter(task => task.id !== taskId));
      
      // Update goal progress after task deletion
      setTimeout(() => {
        updateGoalProgress();
      }, 100);
      
      onTaskUpdate?.();
      toast({
        title: "Task Deleted",
        description: "Task has been removed",
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
