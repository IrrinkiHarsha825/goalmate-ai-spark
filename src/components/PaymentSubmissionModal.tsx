
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface PaymentSubmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId: string;
  amount: number;
  onPaymentSubmitted: () => void;
}

export const PaymentSubmissionModal = ({ 
  open, 
  onOpenChange, 
  goalId, 
  amount,
  onPaymentSubmitted 
}: PaymentSubmissionModalProps) => {
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !transactionId.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('payment_submissions')
        .insert({
          user_id: user.id,
          goal_id: goalId,
          transaction_id: transactionId.trim(),
          amount: Number(amount),
        });

      if (error) throw error;

      toast({
        title: "Payment Submitted Successfully! ✅",
        description: "Your payment is now pending admin approval. We'll activate your goal once verified.",
      });

      setTransactionId("");
      onOpenChange(false);
      onPaymentSubmitted();
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast({
        title: "Error",
        description: "Failed to submit payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Payment Proof</DialogTitle>
          <DialogDescription>
            Complete your payment of ₹{amount} through any UPI app, then submit your transaction ID below for verification.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Payment Instructions:</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Make payment of ₹{amount} via any UPI app</li>
              <li>• Use UPI ID or scan merchant QR code</li>
              <li>• Copy the transaction ID from your payment app</li>
              <li>• Submit the transaction ID below</li>
            </ul>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transactionId">Transaction ID *</Label>
              <Input
                id="transactionId"
                placeholder="e.g., 123456789012"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                Enter the transaction ID you received after making the payment
              </p>
            </div>
            
            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !transactionId.trim()}>
                {loading ? "Submitting..." : "Submit Payment Proof"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
