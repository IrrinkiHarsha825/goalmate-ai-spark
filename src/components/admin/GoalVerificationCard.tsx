
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";

interface GoalVerification {
  id: string;
  goal_id: string;
  user_id: string;
  payment_amount: number;
  transaction_id: string;
  verification_status: string;
  verified_by?: string;
  verified_at?: string;
  admin_notes?: string;
  submitted_at: string;
  user_email?: string;
  goal_title?: string;
}

interface GoalVerificationCardProps {
  verification: GoalVerification;
  onAction: (id: string, action: 'verified' | 'rejected', notes?: string) => void;
  processing: boolean;
}

export const GoalVerificationCard = ({ 
  verification, 
  onAction, 
  processing 
}: GoalVerificationCardProps) => {
  const [notes, setNotes] = useState(verification.admin_notes || "");

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Goal Payment Verification</CardTitle>
            <CardDescription>
              User: {verification.user_email || verification.user_id}
            </CardDescription>
            <CardDescription>
              Goal: {verification.goal_title || verification.goal_id}
            </CardDescription>
          </div>
          <Badge variant={verification.verification_status === 'pending' ? 'secondary' : 
                         verification.verification_status === 'verified' ? 'default' : 'destructive'}>
            {verification.verification_status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Amount</p>
            <p className="text-lg font-bold text-green-600">₹{verification.payment_amount}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Transaction ID</p>
            <p className="font-mono text-sm">{verification.transaction_id}</p>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium mb-2">Submitted</p>
          <p className="text-sm text-gray-600">
            {new Date(verification.submitted_at).toLocaleString()}
          </p>
        </div>

        {verification.verification_status === 'pending' && (
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
                onClick={() => onAction(verification.id, 'verified', notes)}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Verify & Add to Wallet
              </Button>
              <Button
                onClick={() => onAction(verification.id, 'rejected', notes)}
                disabled={processing}
                variant="destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        )}

        {verification.admin_notes && (
          <div>
            <p className="text-sm font-medium">Admin Notes</p>
            <p className="text-sm text-gray-600">{verification.admin_notes}</p>
          </div>
        )}

        {verification.verified_at && (
          <div>
            <p className="text-sm font-medium">Verified At</p>
            <p className="text-sm text-gray-600">
              {new Date(verification.verified_at).toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
