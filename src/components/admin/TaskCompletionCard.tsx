
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock, DollarSign, User, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TaskCompletionSubmission {
  id: string;
  task_id: string;
  user_id: string;
  goal_id: string;
  proof_text?: string;
  proof_image_url?: string;
  status: string;
  admin_notes?: string;
  submitted_at: string;
  reward_amount: number;
  // Joined data
  task_title?: string;
  user_email?: string;
  goal_title?: string;
}

interface TaskCompletionCardProps {
  submission: TaskCompletionSubmission;
  onAction: (id: string, action: 'approved' | 'rejected', notes?: string) => void;
  processing: boolean;
}

export const TaskCompletionCard = ({ submission, onAction, processing }: TaskCompletionCardProps) => {
  const [adminNotes, setAdminNotes] = useState(submission.admin_notes || '');
  const [showNotesInput, setShowNotesInput] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <Clock className="w-3 h-3 mr-1" />
          Pending Review
        </Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleApprove = () => {
    onAction(submission.id, 'approved', adminNotes);
  };

  const handleReject = () => {
    onAction(submission.id, 'rejected', adminNotes);
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Task Completion Request</CardTitle>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {submission.user_email}
              </span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}
              </span>
            </div>
          </div>
          {getStatusBadge(submission.status)}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Task and Goal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Task</h4>
            <p className="text-sm text-gray-700">{submission.task_title}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Goal</h4>
            <p className="text-sm text-gray-700">{submission.goal_title}</p>
          </div>
        </div>

        {/* Reward Amount */}
        <div className="flex items-center justify-center p-2 bg-green-50 rounded-lg">
          <DollarSign className="w-5 h-5 text-green-600 mr-1" />
          <span className="font-semibold text-green-800">
            Reward: ${submission.reward_amount}
          </span>
        </div>

        {/* Proof Submitted */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Proof Submitted</h4>
          {submission.proof_text && (
            <div className="p-3 bg-blue-50 rounded-lg mb-2">
              <p className="text-sm text-gray-700">{submission.proof_text}</p>
            </div>
          )}
          {submission.proof_image_url && (
            <div className="mt-2">
              <img 
                src={submission.proof_image_url} 
                alt="Proof submission" 
                className="max-w-full h-auto rounded-lg border"
              />
            </div>
          )}
        </div>

        {/* Admin Notes */}
        {(submission.admin_notes || showNotesInput) && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Admin Notes</h4>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes for this submission..."
              className="min-h-[80px]"
              disabled={submission.status !== 'pending'}
            />
          </div>
        )}

        {/* Action Buttons */}
        {submission.status === 'pending' && (
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            {!showNotesInput && (
              <Button
                variant="outline"
                onClick={() => setShowNotesInput(true)}
                className="flex-1"
              >
                Add Notes
              </Button>
            )}
            <Button
              onClick={handleApprove}
              disabled={processing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {processing ? "Processing..." : "Approve & Pay"}
            </Button>
            <Button
              onClick={handleReject}
              disabled={processing}
              variant="destructive"
              className="flex-1"
            >
              {processing ? "Processing..." : "Reject"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
