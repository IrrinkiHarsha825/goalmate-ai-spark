
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Wallet } from "lucide-react";

interface WithdrawalRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxAmount: number;
  onWithdrawalRequested: () => void;
}

export const WithdrawalRequestModal = ({ 
  open, 
  onOpenChange, 
  maxAmount,
  onWithdrawalRequested 
}: WithdrawalRequestModalProps) => {
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to request withdrawal",
        variant: "destructive",
      });
      return;
    }

    if (!amount || !upiId.trim()) {
      toast({
        title: "All Fields Required",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (withdrawalAmount > maxAmount) {
      toast({
        title: "Insufficient Balance",
        description: `Amount cannot exceed your available balance of ₹${maxAmount.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }

    // Basic UPI ID validation
    if (!upiId.includes('@') || upiId.length < 5) {
      toast({
        title: "Invalid UPI ID",
        description: "Please enter a valid UPI ID (e.g., user@paytm)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Submitting withdrawal request:', {
        user_id: user.id,
        amount: withdrawalAmount,
        upi_id: upiId.trim()
      });

      // Check for existing pending withdrawal requests
      const { data: existingRequest, error: checkError } = await supabase
        .from('withdrawal_requests')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing requests:', checkError);
        throw checkError;
      }

      if (existingRequest) {
        toast({
          title: "Pending Request Exists",
          description: "You already have a pending withdrawal request. Please wait for admin approval.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: user.id,
          amount: withdrawalAmount,
          upi_id: upiId.trim(),
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating withdrawal request:', error);
        throw error;
      }

      console.log('Withdrawal request created:', data);

      toast({
        title: "Withdrawal Request Submitted ✅",
        description: "Your withdrawal request is pending admin approval. You'll be notified once processed.",
      });

      setAmount("");
      setUpiId("");
      onOpenChange(false);
      onWithdrawalRequested();
    } catch (error: any) {
      console.error('Error submitting withdrawal request:', error);
      toast({
        title: "Submission Failed",
        description: error?.message || "Failed to submit withdrawal request. Please try again.",
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
            <Wallet className="h-5 w-5 text-green-600" />
            Request Withdrawal
          </DialogTitle>
          <DialogDescription>
            Request to withdraw funds from your wallet. Maximum available: ₹{maxAmount.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Withdrawal requests require admin verification and may take 1-3 business days
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Withdrawal Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                max={maxAmount}
                step="0.01"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Minimum: ₹1 | Maximum: ₹{maxAmount.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upiId">UPI ID *</Label>
              <Input
                id="upiId"
                placeholder="user@paytm, user@googlepay, etc."
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                required
                disabled={loading}
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                Enter your UPI ID where you want to receive the funds
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
                disabled={loading || !amount || !upiId.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
