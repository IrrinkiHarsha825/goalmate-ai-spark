
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";

interface PaymentSubmission {
  id: string;
  user_id: string;
  goal_id: string;
  transaction_id: string;
  amount: number;
  status: string;
  submitted_at: string;
  admin_notes?: string;
}

interface PaymentSubmissionCardProps {
  submission: PaymentSubmission;
  onAction: (id: string, action: 'approved' | 'rejected', notes?: string) => void;
  processing: boolean;
}

export const PaymentSubmissionCard = ({ 
  submission, 
  onAction, 
  processing 
}: PaymentSubmissionCardProps) => {
  const [notes, setNotes] = useState(submission.admin_notes || "");

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Payment Submission</CardTitle>
            <CardDescription>
              User ID: {submission.user_id}
            </CardDescription>
          </div>
          <Badge variant={submission.status === 'pending' ? 'secondary' : 
                         submission.status === 'approved' ? 'default' : 'destructive'}>
            {submission.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Amount</p>
            <p className="text-lg font-bold text-green-600">₹{submission.amount}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Transaction ID</p>
            <p className="font-mono text-sm">{submission.transaction_id}</p>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium mb-2">Submitted</p>
          <p className="text-sm text-gray-600">
            {new Date(submission.submitted_at).toLocaleString()}
          </p>
        </div>

        {submission.status === 'pending' && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Admin Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes (optional)"
                className="mt-1"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => onAction(submission.id, 'approved', notes)}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => onAction(submission.id, 'rejected', notes)}
                disabled={processing}
                variant="destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        )}

        {submission.admin_notes && (
          <div>
            <p className="text-sm font-medium">Admin Notes</p>
            <p className="text-sm text-gray-600">{submission.admin_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
