
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Brain, Edit, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDifficulty, setNewTaskDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
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

  const addManualTask = async () => {
    if (!newTaskTitle.trim()) return;

    setLoading(true);
    try {
      const rewardAmount = difficultyRewards[newTaskDifficulty];
      const taskData: TaskInsert = {
        goal_id: goalId,
        title: newTaskTitle.trim(),
        difficulty: newTaskDifficulty,
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
      setNewTaskTitle("");
      setNewTaskDifficulty('medium');
      setShowManualInput(false);
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

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
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
        {/* Task creation options */}
        {tasks.length === 0 ? (
          <div className="space-y-4">
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">How would you like to create tasks?</h3>
              <p className="text-gray-600 mb-4">Choose between AI-generated tasks or create them manually</p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={generateAITasks}
                  disabled={aiLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  {aiLoading ? "Generating..." : "Generate AI Tasks"}
                </Button>
                
                <Button 
                  onClick={() => setShowManualInput(true)}
                  variant="outline"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Create Manually
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={() => setShowManualInput(true)}
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Manual Task
            </Button>
            
            <Button 
              onClick={generateAITasks}
              disabled={aiLoading}
              variant="outline"
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Brain className="h-4 w-4 mr-2" />
              {aiLoading ? "Generating..." : "Add AI Tasks"}
            </Button>
            
            {tasks.length > 0 && (
              <Button 
                onClick={clearAllTasks}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Clear All
              </Button>
            )}
          </div>
        )}

        {/* Manual task input */}
        {showManualInput && (
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
            <Input
              placeholder="Enter task description..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addManualTask()}
            />
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Difficulty:</label>
              <Select value={newTaskDifficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setNewTaskDifficulty(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy ($10)</SelectItem>
                  <SelectItem value="medium">Medium ($25)</SelectItem>
                  <SelectItem value="hard">Hard ($50)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={addManualTask} disabled={loading || !newTaskTitle.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
              <Button 
                onClick={() => {
                  setShowManualInput(false);
                  setNewTaskTitle("");
                  setNewTaskDifficulty('medium');
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Task list */}
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <Checkbox
                checked={task.completed}
                onCheckedChange={(checked) => toggleTask(task.id, !!checked)}
              />
              <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                {task.title}
              </span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded border ${getDifficultyColor(task.difficulty)}`}>
                  {task.difficulty}
                </span>
                <span className="text-green-600 font-medium text-sm flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {task.reward_amount}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTask(task.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {totalTasks > 0 && (
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
        )}
      </CardContent>
    </Card>
  );
};
