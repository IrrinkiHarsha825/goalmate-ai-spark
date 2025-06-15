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
  task_title?: string;
  user_email?: string;
  goal_title?: string;
}

export const useAdminData = () => {
  const [paymentSubmissions, setPaymentSubmissions] = useState<PaymentSubmission[]>([]);
  const [goalVerifications, setGoalVerifications] = useState<GoalVerification[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [taskCompletionSubmissions, setTaskCompletionSubmissions] = useState<TaskCompletionSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch goal verifications (new payment verification system)
      console.log('Fetching goal verifications...');
      const { data: verifications, error: verificationsError } = await supabase
        .from('goal_verifications')
        .select(`
          *,
          goals(title),
          profiles(email)
        `)
        .order('submitted_at', { ascending: false });

      if (verificationsError) {
        console.error('Error fetching goal verifications:', verificationsError);
        throw verificationsError;
      }

      const formattedVerifications = (verifications || []).map(verification => ({
        ...verification,
        user_email: verification.profiles?.email,
        goal_title: verification.goals?.title
      }));
      
      console.log('Goal verifications fetched:', formattedVerifications);
      setGoalVerifications(formattedVerifications);

      // Still fetch old payment submissions for backward compatibility
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

      // For now, set empty task completion submissions until the table exists
      console.log('Task completion submissions table not yet available');
      setTaskCompletionSubmissions([]);

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

  useEffect(() => {
    if (user) {
      fetchData();
      
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const updateGoalVerificationStatus = (id: string, status: string, notes?: string) => {
    setGoalVerifications(prev => 
      prev.map(verification => 
        verification.id === id 
          ? { ...verification, verification_status: status, admin_notes: notes }
          : verification
      )
    );
  };

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

  const updateTaskCompletionSubmissionStatus = (id: string, status: string, notes?: string) => {
    setTaskCompletionSubmissions(prev => 
      prev.map(submission => 
        submission.id === id 
          ? { ...submission, status, admin_notes: notes }
          : submission
      )
    );
  };

  return {
    paymentSubmissions,
    goalVerifications,
    withdrawalRequests,
    taskCompletionSubmissions,
    loading,
    fetchData,
    updatePaymentSubmissionStatus,
    updateGoalVerificationStatus,
    updateWithdrawalRequestStatus,
    updateTaskCompletionSubmissionStatus
  };
};
