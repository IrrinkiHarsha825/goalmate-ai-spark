
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  upi_id: string;
  status: string;
  requested_at: string;
  admin_notes?: string;
}

export const useAdminData = () => {
  const [paymentSubmissions, setPaymentSubmissions] = useState<PaymentSubmission[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching payment submissions...');
      const { data: payments, error: paymentsError } = await supabase
        .from('payment_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
        throw paymentsError;
      }
      
      console.log('Payment submissions fetched:', payments);
      setPaymentSubmissions(payments || []);

      console.log('Fetching withdrawal requests...');
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (withdrawalsError) {
        console.error('Error fetching withdrawals:', withdrawalsError);
        throw withdrawalsError;
      }
      
      console.log('Withdrawal requests fetched:', withdrawals);
      setWithdrawalRequests(withdrawals || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh data every 30 seconds to ensure UI stays updated
  useEffect(() => {
    if (user) {
      fetchData();
      
      // Set up auto-refresh
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Optimistically update local state after actions
  const updatePaymentSubmissionStatus = (id: string, status: string, notes?: string) => {
    setPaymentSubmissions(prev => 
      prev.map(submission => 
        submission.id === id 
          ? { ...submission, status, admin_notes: notes }
          : submission
      )
    );
  };

  const updateWithdrawalRequestStatus = (id: string, status: string, notes?: string) => {
    setWithdrawalRequests(prev => 
      prev.map(request => 
        request.id === id 
          ? { ...request, status, admin_notes: notes }
          : request
      )
    );
  };

  return {
    paymentSubmissions,
    withdrawalRequests,
    loading,
    fetchData,
    updatePaymentSubmissionStatus,
    updateWithdrawalRequestStatus
  };
};
