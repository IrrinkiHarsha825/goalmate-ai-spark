
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  upi_id: string;
  status: string;
  requested_at: string;
  admin_notes?: string;
}

interface WithdrawalRequestCardProps {
  request: WithdrawalRequest;
  onAction: (id: string, action: 'approved' | 'rejected', notes?: string) => void;
  processing: boolean;
}

export const WithdrawalRequestCard = ({ 
  request, 
  onAction, 
  processing 
}: WithdrawalRequestCardProps) => {
  const [notes, setNotes] = useState(request.admin_notes || "");

  return (
    <Card className="border-l-4 border-l-yellow-500">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Withdrawal Request</CardTitle>
            <CardDescription>
              User ID: {request.user_id}
            </CardDescription>
          </div>
          <Badge variant={request.status === 'pending' ? 'secondary' : 
                         request.status === 'approved' ? 'default' : 'destructive'}>
            {request.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Amount</p>
            <p className="text-lg font-bold text-green-600">₹{request.amount}</p>
          </div>
          <div>
            <p className="text-sm font-medium">UPI ID</p>
            <p className="font-mono text-sm">{request.upi_id}</p>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium mb-2">Requested</p>
          <p className="text-sm text-gray-600">
            {new Date(request.requested_at).toLocaleString()}
          </p>
        </div>

        {request.status === 'pending' && (
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
                onClick={() => onAction(request.id, 'approved', notes)}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => onAction(request.id, 'rejected', notes)}
                disabled={processing}
                variant="destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        )}

        {request.admin_notes && (
          <div>
            <p className="text-sm font-medium">Admin Notes</p>
            <p className="text-sm text-gray-600">{request.admin_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
