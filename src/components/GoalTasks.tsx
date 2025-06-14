
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Brain, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];

interface GoalTasksProps {
  goalId: string;
  goalTitle: string;
  goalDescription?: string;
}

export const GoalTasks = ({ goalId, goalTitle, goalDescription }: GoalTasksProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const { toast } = useToast();

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

  const generateAITasks = async () => {
    setAiLoading(true);
    try {
      // Simulate AI task generation based on goal
      const aiGeneratedTasks = [
        `Research and plan approach for: ${goalTitle}`,
        `Break down ${goalTitle} into smaller milestones`,
        `Set up necessary resources and tools`,
        `Create weekly progress checkpoints`,
        `Execute first phase of ${goalTitle}`,
        `Review and adjust strategy if needed`,
        `Complete final implementation`,
        `Evaluate results and document learnings`
      ];

      // Add each AI-generated task to the database
      for (const taskTitle of aiGeneratedTasks) {
        const taskData: TaskInsert = {
          goal_id: goalId,
          title: taskTitle,
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

      toast({
        title: "AI Tasks Generated",
        description: `Generated ${aiGeneratedTasks.length} tasks for your goal`,
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
      const taskData: TaskInsert = {
        goal_id: goalId,
        title: newTaskTitle.trim(),
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
      setShowManualInput(false);
      toast({
        title: "Task Added",
        description: "New task has been added to your goal",
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

      toast({
        title: completed ? "Task Completed!" : "Task Unchecked",
        description: completed ? "Great progress!" : "Task marked as incomplete",
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
      toast({
        title: "All Tasks Cleared",
        description: "All tasks have been removed",
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

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Tasks for "{goalTitle}"</span>
          <span className="text-sm font-normal text-gray-600">
            {completedTasks}/{totalTasks} completed ({Math.round(progressPercentage)}%)
          </span>
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
          <div className="flex gap-2 p-4 bg-blue-50 rounded-lg">
            <Input
              placeholder="Enter task description..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addManualTask()}
            />
            <Button onClick={addManualTask} disabled={loading || !newTaskTitle.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => {
                setShowManualInput(false);
                setNewTaskTitle("");
              }}
              variant="outline"
            >
              Cancel
            </Button>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteTask(task.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {totalTasks > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
