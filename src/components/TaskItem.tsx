
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Trash2, CheckCircle, Send } from "lucide-react";
import { ProofVerificationModal } from "./ProofVerificationModal";
import type { Database } from "@/integrations/supabase/types";

type Task = Database['public']['Tables']['tasks']['Row'];

interface TaskItemProps {
  task: Task;
  goalType?: string;
  goalStatus?: string;
  onToggle: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
  onTaskCompletionSubmitted: (taskId: string, proofData: any) => void;
}

export const TaskItem = ({ task, goalType, goalStatus, onToggle, onDelete, onTaskCompletionSubmitted }: TaskItemProps) => {
  const [showProofModal, setShowProofModal] = useState(false);

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

  const handleSubmitCompletion = () => {
    setShowProofModal(true);
  };

  const handleProofSubmitted = (proofData: any) => {
    onTaskCompletionSubmitted(task.id, proofData);
  };

  const handleToggle = () => {
    onToggle(task.id, !task.completed);
  };

  return (
    <>
      <div className="flex items-center gap-3 p-3 border rounded-lg transition-colors hover:bg-gray-50">
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleToggle}
        />
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
              {task.title}
            </span>
            {task.completed && (
              <Badge variant="outline" className="text-xs text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded border ${getDifficultyColor(task.difficulty)}`}>
            {task.difficulty}
          </span>
          
          <span className="font-medium text-sm flex items-center text-green-600">
            <DollarSign className="h-3 w-3 mr-1" />
            {task.reward_amount}
          </span>

          {!task.completed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSubmitCompletion}
              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            disabled={task.completed}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ProofVerificationModal
        open={showProofModal}
        onOpenChange={setShowProofModal}
        task={task}
        goalType={goalType}
        onProofSubmitted={handleProofSubmitted}
      />
    </>
  );
};
