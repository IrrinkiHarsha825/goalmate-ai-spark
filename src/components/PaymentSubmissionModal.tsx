
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CreditCard } from "lucide-react";

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
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to submit payment",
        variant: "destructive",
      });
      return;
    }

    if (!transactionId.trim()) {
      toast({
        title: "Transaction ID Required",
        description: "Please enter a valid transaction ID",
        variant: "destructive",
      });
      return;
    }

    if (!goalId) {
      toast({
        title: "Error",
        description: "Goal ID is missing",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Submitting payment verification with data:', {
        user_id: user.id,
        goal_id: goalId,
        transaction_id: transactionId.trim(),
        payment_amount: Number(amount),
      });

      // Check if there's already a pending verification for this goal
      const { data: existingVerification, error: checkError } = await supabase
        .from('goal_verifications')
        .select('id, verification_status')
        .eq('goal_id', goalId)
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing verifications:', checkError);
        throw checkError;
      }

      if (existingVerification) {
        if (existingVerification.verification_status === 'pending') {
          toast({
            title: "Verification Already Exists",
            description: "You already have a pending payment verification for this goal",
            variant: "destructive",
          });
          return;
        } else if (existingVerification.verification_status === 'verified') {
          toast({
            title: "Payment Already Verified",
            description: "This goal already has a verified payment",
            variant: "destructive",
          });
          return;
        }
      }

      const { data, error } = await supabase
        .from('goal_verifications')
        .insert({
          user_id: user.id,
          goal_id: goalId,
          transaction_id: transactionId.trim(),
          payment_amount: Number(amount),
          verification_status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Payment verification submission error:', error);
        throw error;
      }

      console.log('Payment verification submitted successfully:', data);

      toast({
        title: "Payment Submitted Successfully! ✅",
        description: "Your payment is now pending admin verification. Your goal will be activated once approved.",
      });

      setTransactionId("");
      onOpenChange(false);
      onPaymentSubmitted();
    } catch (error: any) {
      console.error('Error submitting payment verification:', error);
      toast({
        title: "Payment Submission Failed",
        description: error?.message || "Failed to submit payment. Please try again.",
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
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Submit Payment Proof
          </DialogTitle>
          <DialogDescription>
            Complete your payment of ₹{amount} and submit your transaction ID for admin verification.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Payment Instructions:
            </h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Make payment of ₹{amount} via any UPI app</li>
              <li>• Use UPI ID or scan merchant QR code</li>
              <li>• Copy the transaction ID from your payment app</li>
              <li>• Submit the transaction ID below for verification</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-amber-800 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <strong>Important:</strong> Your goal will remain locked until admin verifies your payment
            </p>
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
                disabled={loading}
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                Enter the exact transaction ID you received after making the payment
              </p>
            </div>
            
            <DialogFooter className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !transactionId.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Submitting..." : "Submit Payment Proof"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
