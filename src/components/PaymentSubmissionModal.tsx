
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PaymentQRCode } from "./PaymentQRCode";

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
        title: "Payment Submitted",
        description: "Your payment submission is pending admin approval",
      });

      setTransactionId("");
      onOpenChange(false);
      onPaymentSubmitted();
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast({
        title: "Error",
        description: "Failed to submit payment",
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
            Complete the payment using the QR code below, then submit your transaction ID for verification.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <PaymentQRCode amount={String(amount)} goalTitle="Goal Commitment" />
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transactionId">Transaction ID</Label>
              <Input
                id="transactionId"
                placeholder="Enter your transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                required
              />
            </div>
            
            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !transactionId.trim()}>
                {loading ? "Submitting..." : "Submit Payment"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
