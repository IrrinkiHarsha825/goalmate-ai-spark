import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TaskCreationControls } from "./TaskCreationControls";
import { TaskList } from "./TaskList";
import { TaskProgressDisplay } from "./TaskProgressDisplay";
import { MilestoneProgress } from "./MilestoneProgress";
import type { Database } from "@/integrations/supabase/types";

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];

interface GoalTasksProps {
  goalId: string;
  goalTitle: string;
  goalDescription?: string;
  goalTargetAmount?: number;
  goalCurrentAmount?: number;
  goalType?: string;
  goalStatus?: string; // Add goal status prop
  commitmentAmount?: number;
  onTaskUpdate?: () => void;
}

export const GoalTasks = ({ 
  goalId, 
  goalTitle, 
  goalDescription, 
  goalTargetAmount, 
  goalCurrentAmount = 0,
  goalType = "general",
  goalStatus = "inactive", // Default to inactive
  commitmentAmount = 0,
  onTaskUpdate 
}: GoalTasksProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [goalVerificationStatus, setGoalVerificationStatus] = useState<string>('unverified');
  const { toast } = useToast();

  // Calculate equal reward per task by dividing total commitment by number of tasks
  const calculateEqualTaskReward = (totalTasks: number, totalCommitment: number) => {
    if (!totalCommitment || totalTasks === 0) {
      return 25; // Default fallback amount
    }
    return Math.round(totalCommitment / totalTasks);
  };

  const recalculateAllTaskRewards = async (currentTasks: Task[]) => {
    if (!commitmentAmount || currentTasks.length === 0) return;

    try {
      const equalRewardPerTask = calculateEqualTaskReward(currentTasks.length, commitmentAmount);
      
      for (const task of currentTasks) {
        const { error } = await supabase
          .from('tasks')
          .update({ reward_amount: equalRewardPerTask })
          .eq('id', task.id);

        if (error) throw error;
      }

      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => ({ ...task, reward_amount: equalRewardPerTask }))
      );
    } catch (error) {
      console.error('Error recalculating task rewards:', error);
    }
  };

  const fetchGoalVerificationStatus = async () => {
    try {
      const { data: goal, error } = await supabase
        .from('goals')
        .select('verification_status, status')
        .eq('id', goalId)
        .single();

      if (error) throw error;

      setGoalVerificationStatus(goal.verification_status || 'unverified');
    } catch (error) {
      console.error('Error fetching goal verification status:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('goal_id', goalId)
        .order('created_at', { ascending: true });

      if (tasksError) throw tasksError;

      setTasks(tasksData || []);
      
      if (tasksData && tasksData.length > 0 && commitmentAmount) {
        await recalculateAllTaskRewards(tasksData);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchGoalVerificationStatus();
  }, [goalId, commitmentAmount]);

  const checkAndUpdateMilestones = async (newCurrentAmount: number) => {
    if (!commitmentAmount) return;

    const progressPercentage = (newCurrentAmount / commitmentAmount) * 100;
    const milestones = [25, 50, 75, 100];

    for (const milestone of milestones) {
      if (progressPercentage >= milestone) {
        const milestoneReward = Math.round(commitmentAmount * 0.25);
        
        toast({
          title: "🎉 Milestone Achieved!",
          description: `You've reached ${milestone}% and earned $${milestoneReward}!`,
        });
      }
    }
  };

  const handleTaskCompletionSubmitted = async (taskId: string, proofData: any) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // For now, just show a message that the feature will be available soon
      toast({
        title: "Feature Coming Soon! ⏳",
        description: "Task completion submission will be available after database setup. The admin can manually mark tasks as complete for now.",
      });

      console.log('Task completion data:', { taskId, proofData, task });
    } catch (error) {
      console.error('Error submitting task completion:', error);
      toast({
        title: "Error",
        description: "Failed to submit task completion. Please try again.",
        variant: "destructive",
      });
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
      const equalRewardPerTask = calculateEqualTaskReward(totalTasksAfterAdd, commitmentAmount);

      for (const task of aiGeneratedTasks) {
        const taskData: TaskInsert = {
          goal_id: goalId,
          title: task.title,
          difficulty: task.difficulty,
          reward_amount: equalRewardPerTask,
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
      
      if (commitmentAmount) {
        await recalculateAllTaskRewards(updatedTasks);
      }

      toast({
        title: "AI Tasks Generated",
        description: `Generated ${aiGeneratedTasks.length} tasks with $${equalRewardPerTask} each`,
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
      const equalRewardPerTask = calculateEqualTaskReward(totalTasksAfterAdd, commitmentAmount);
      
      const taskData: TaskInsert = {
        goal_id: goalId,
        title,
        difficulty,
        reward_amount: equalRewardPerTask,
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
      
      if (commitmentAmount) {
        await recalculateAllTaskRewards(updatedTasks);
      }
      
      toast({
        title: "Task Added",
        description: `Task added with $${equalRewardPerTask} reward (equal distribution)`,
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
    // Only allow task completion if goal is verified/active
    if (goalVerificationStatus !== 'verified' && goalStatus !== 'active') {
      toast({
        title: "Goal Not Active",
        description: "Wait for admin to verify your payment before completing tasks",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, completed } : task
        )
      );

      const task = tasks.find(t => t.id === taskId);
      if (task && completed) {
        // Update goal's current amount when task is completed
        const newCurrentAmount = goalCurrentAmount + (task.reward_amount || 0);
        
        const { error: goalError } = await supabase
          .from('goals')
          .update({ current_amount: newCurrentAmount })
          .eq('id', goalId);

        if (!goalError) {
          onTaskUpdate?.();
          await checkAndUpdateMilestones(newCurrentAmount);
          
          toast({
            title: "Task Completed! 🎉",
            description: `You earned $${task.reward_amount}! Total: $${newCurrentAmount}`,
          });
        }
      }
    } catch (error) {
      console.error('Error toggling task:', error);
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

      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      
      if (commitmentAmount && updatedTasks.length > 0) {
        await recalculateAllTaskRewards(updatedTasks);
      }
      
      const newRewardAmount = updatedTasks.length > 0 ? calculateEqualTaskReward(updatedTasks.length, commitmentAmount) : 0;
      
      toast({
        title: "Task Deleted",
        description: `Task removed. Each remaining task now worth $${newRewardAmount}`,
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

  const totalTasks = tasks.length;
  const rewardPerTask = totalTasks > 0 ? calculateEqualTaskReward(totalTasks, commitmentAmount) : 0;
  const isGoalActive = goalVerificationStatus === 'verified' || goalStatus === 'active';

  return (
    <div className="space-y-4">
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Tasks for "{goalTitle}"</span>
            <div className="flex items-center gap-4 text-sm font-normal">
              <span className="text-gray-600">
                {totalTasks} tasks × ${rewardPerTask} each
              </span>
              <span className="text-green-600 flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                ${goalCurrentAmount} / ${commitmentAmount} earned
              </span>
            </div>
          </CardTitle>
          
          {!isGoalActive && (
            <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
              🔒 <strong>Goal Locked:</strong> Tasks are locked until admin verifies your payment submission. You can create tasks but cannot complete them yet.
            </div>
          )}
          
          {isGoalActive && commitmentAmount > 0 && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
              ✅ <strong>Goal Active:</strong> Complete tasks to earn ${rewardPerTask} per task!
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
            goalType={goalType}
            goalStatus={isGoalActive ? 'active' : 'inactive'}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onTaskCompletionSubmitted={handleTaskCompletionSubmitted}
          />

          <TaskProgressDisplay 
            tasks={tasks} 
            goalCurrentAmount={goalCurrentAmount}
            goalTargetAmount={commitmentAmount}
          />
        </CardContent>
      </Card>

      {/* Milestone Progress Component */}
      {commitmentAmount > 0 && (
        <MilestoneProgress
          goalId={goalId}
          currentProgress={goalCurrentAmount}
          targetAmount={commitmentAmount}
          totalEarned={goalCurrentAmount}
        />
      )}
    </div>
  );
};
