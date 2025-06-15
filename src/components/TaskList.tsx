
import { TaskItem } from "./TaskItem";
import type { Database } from "@/integrations/supabase/types";

type Task = Database['public']['Tables']['tasks']['Row'];

interface TaskListProps {
  tasks: Task[];
  goalType?: string;
  goalStatus?: string;
  onToggleTask: (taskId: string, completed: boolean) => void;
  onDeleteTask: (taskId: string) => void;
  onTaskCompletionSubmitted?: (taskId: string, proofData: any) => void;
}

export const TaskList = ({ 
  tasks, 
  goalType, 
  goalStatus,
  onToggleTask, 
  onDeleteTask, 
  onTaskCompletionSubmitted 
}: TaskListProps) => {
  if (tasks.length === 0) return null;

  const handleTaskCompletionSubmitted = (taskId: string, proofData: any) => {
    onTaskCompletionSubmitted?.(taskId, proofData);
  };

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          goalType={goalType}
          goalStatus={goalStatus}
          onToggle={onToggleTask}
          onDelete={onDeleteTask}
          onTaskCompletionSubmitted={handleTaskCompletionSubmitted}
        />
      ))}
    </div>
  );
};
