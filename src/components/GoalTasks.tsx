import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TaskCreationControls } from "./TaskCreationControls";
import { TaskList } from "./TaskList";
import { TaskProgressDisplay } from "./TaskProgressDisplay";
import { MilestoneProgress } from "./MilestoneProgress";
import { AIVerificationService, ProofData } from "@/services/aiVerificationService";
import type { Database } from "@/integrations/supabase/types";

type Task = Database['public']['Tables']['tasks']['Row'] & {
  verified?: boolean;
  proof_text?: string;
  proof_image_url?: string;
  verification_feedback?: string;
};
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];

interface GoalTasksProps {
  goalId: string;
  goalTitle: string;
  goalDescription?: string;
  goalTargetAmount?: number;
  goalCurrentAmount?: number;
  goalType?: string;
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
  commitmentAmount = 0,
  onTaskUpdate 
}: GoalTasksProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const { toast } = useToast();

  // Calculate reward per task by dividing commitment amount by number of tasks
  const calculateTaskReward = (totalTasks: number, commitmentAmount: number) => {
    if (!commitmentAmount || totalTasks === 0) {
      return 25; // Default fallback amount
    }
    return Math.round(commitmentAmount / totalTasks);
  };

  const recalculateAllTaskRewards = async (currentTasks: Task[]) => {
    if (!commitmentAmount || currentTasks.length === 0) return;

    try {
      const rewardPerTask = calculateTaskReward(currentTasks.length, commitmentAmount);
      
      for (const task of currentTasks) {
        const { error } = await supabase
          .from('tasks')
          .update({ reward_amount: rewardPerTask })
          .eq('id', task.id);

        if (error) throw error;
      }

      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => ({ ...task, reward_amount: rewardPerTask }))
      );
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
      
      if (data && data.length > 0 && commitmentAmount) {
        await recalculateAllTaskRewards(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [goalId, commitmentAmount]);

  const checkAndUpdateMilestones = async (newCurrentAmount: number) => {
    if (!goalTargetAmount) return;

    const progressPercentage = (newCurrentAmount / goalTargetAmount) * 100;
    const milestones = [25, 50, 75, 100];

    for (const milestone of milestones) {
      if (progressPercentage >= milestone) {
        // For now, just show toast until database is updated
        const milestoneReward = Math.round(commitmentAmount * 0.25);
        
        toast({
          title: "🎉 Milestone Achieved!",
          description: `You've reached ${milestone}% and earned $${milestoneReward}!`,
        });
      }
    }
  };

  const handleProofSubmitted = async (taskId: string, proofData: ProofData) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Get AI verification
      const verification = await AIVerificationService.verifyProof(
        task.title,
        task.difficulty || 'medium',
        proofData
      );

      // For now, simulate database update until schema is updated
      const updatedTask = {
        ...task,
        proof_text: proofData.text || `${proofData.type} proof submitted`,
        verified: verification.verified,
        verification_feedback: verification.feedback
      };

      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(t => t.id === taskId ? updatedTask : t)
      );

      if (verification.verified) {
        // Add reward to goal and check milestones
        const rewardAmount = task.reward_amount || 0;
        const newCurrentAmount = goalCurrentAmount + rewardAmount;

        await supabase
          .from('goals')
          .update({ current_amount: newCurrentAmount })
          .eq('id', goalId);

        // Remove the completed task
        await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId);

        setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));

        // Check for milestone achievements
        await checkAndUpdateMilestones(newCurrentAmount);

        onTaskUpdate?.();

        toast({
          title: "✅ Task Verified!",
          description: `Great work! You earned $${rewardAmount}. ${verification.feedback}`,
        });
      } else {
        toast({
          title: "❌ Verification Failed",
          description: verification.feedback,
          variant: "destructive",
        });

        if (verification.suggestions) {
          toast({
            title: "💡 Suggestions",
            description: verification.suggestions.join(". "),
          });
        }
      }
    } catch (error) {
      console.error('Error submitting proof:', error);
      toast({
        title: "Error",
        description: "Failed to submit proof. Please try again.",
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
      const rewardPerTask = calculateTaskReward(totalTasksAfterAdd, commitmentAmount);

      for (const task of aiGeneratedTasks) {
        const taskData: TaskInsert = {
          goal_id: goalId,
          title: task.title,
          difficulty: task.difficulty,
          reward_amount: rewardPerTask,
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
        description: `Generated ${aiGeneratedTasks.length} tasks with equally distributed rewards`,
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
      const rewardPerTask = calculateTaskReward(totalTasksAfterAdd, commitmentAmount);
      
      const taskData: TaskInsert = {
        goal_id: goalId,
        title,
        difficulty,
        reward_amount: rewardPerTask,
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
        description: `Task added with $${rewardPerTask} reward (equally distributed)`,
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
    // This function is now mainly handled by proof verification
    // Keeping for backward compatibility
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
      
      toast({
        title: "Task Deleted",
        description: "Task removed and rewards redistributed equally",
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

  return (
    <div className="space-y-4">
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Tasks for "{goalTitle}"</span>
            <div className="flex items-center gap-4 text-sm font-normal">
              <span className="text-gray-600">
                {totalTasks} remaining tasks
              </span>
              <span className="text-green-600 flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                ${goalCurrentAmount} {goalTargetAmount ? `/ $${goalTargetAmount}` : ''} earned
              </span>
            </div>
          </CardTitle>
          {goalTargetAmount && (
            <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
              💡 Complete tasks with proof verification to earn rewards! Money is divided equally between all tasks.
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
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onProofSubmitted={handleProofSubmitted}
          />

          <TaskProgressDisplay 
            tasks={tasks} 
            goalCurrentAmount={goalCurrentAmount}
            goalTargetAmount={goalTargetAmount}
          />
        </CardContent>
      </Card>

      {/* Milestone Progress Component */}
      {commitmentAmount > 0 && (
        <MilestoneProgress
          goalId={goalId}
          currentProgress={goalCurrentAmount}
          targetAmount={goalTargetAmount || 0}
          totalEarned={goalCurrentAmount}
        />
      )}
    </div>
  );
};
