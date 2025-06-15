
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Trash2, Shield, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { ProofVerificationModal } from "./ProofVerificationModal";
import type { Database } from "@/integrations/supabase/types";

type Task = Database['public']['Tables']['tasks']['Row'] & {
  proof_status?: 'pending' | 'approved' | 'rejected';
  admin_feedback?: string;
};

interface TaskItemProps {
  task: Task;
  goalType?: string;
  onToggle: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
  onProofSubmitted: (taskId: string, proofData: any) => void;
}

export const TaskItem = ({ task, goalType, onToggle, onDelete, onProofSubmitted }: TaskItemProps) => {
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

  const getProofStatus = () => {
    if (task.proof_status === 'approved') {
      return { icon: CheckCircle, color: 'text-green-600', label: 'Approved' };
    } else if (task.proof_status === 'pending') {
      return { icon: Clock, color: 'text-yellow-600', label: 'Pending Admin Review' };
    } else if (task.proof_status === 'rejected') {
      return { icon: AlertCircle, color: 'text-red-600', label: 'Rejected' };
    }
    return null;
  };

  const handleCompleteTask = () => {
    if (task.proof_status === 'approved') {
      // Task is verified by admin, complete it
      onToggle(task.id, true);
    } else {
      // Need to submit proof for admin verification
      setShowProofModal(true);
    }
  };

  const handleProofSubmitted = (proofData: any) => {
    onProofSubmitted(task.id, proofData);
  };

  const proofStatus = getProofStatus();

  return (
    <>
      <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
        <Checkbox
          checked={false}
          onCheckedChange={handleCompleteTask}
          disabled={task.proof_status && task.proof_status !== 'approved'}
        />
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{task.title}</span>
            {proofStatus && (
              <Badge variant="outline" className={`text-xs ${proofStatus.color}`}>
                <proofStatus.icon className="h-3 w-3 mr-1" />
                {proofStatus.label}
              </Badge>
            )}
          </div>
          
          {task.admin_feedback && (
            <div className="text-xs text-gray-600 mt-1">
              <strong>Admin Feedback:</strong> {task.admin_feedback}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded border ${getDifficultyColor(task.difficulty)}`}>
            {task.difficulty}
          </span>
          
          <span className="text-green-600 font-medium text-sm flex items-center">
            <DollarSign className="h-3 w-3 mr-1" />
            {task.reward_amount}
          </span>

          {!task.proof_status && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProofModal(true)}
              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            >
              <Shield className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
