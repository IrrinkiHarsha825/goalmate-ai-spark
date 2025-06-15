
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
      console.log('Fetching goal verifications as admin...');
      
      // Check if user is admin first
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();
      
      console.log('Admin profile check:', profile);
      
      if (profile?.role !== 'admin' && user?.user_metadata?.role !== 'admin') {
        console.log('User is not admin, skipping admin data fetch');
        setLoading(false);
        return;
      }

      // Fetch goal verifications with explicit admin bypass
      const { data: verifications, error: verificationsError } = await supabase
        .from('goal_verifications')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (verificationsError) {
        console.error('Error fetching goal verifications:', verificationsError);
        // Don't throw here, continue with other data
      } else {
        console.log('Raw goal verifications:', verifications);
        
        // Get user emails and goal titles separately
        const formattedVerifications = [];
        for (const verification of verifications || []) {
          // Get user email
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', verification.user_id)
            .single();

          // Get goal title
          const { data: goal } = await supabase
            .from('goals')
            .select('title')
            .eq('id', verification.goal_id)
            .single();

          formattedVerifications.push({
            ...verification,
            user_email: userProfile?.email || 'Unknown User',
            goal_title: goal?.title || 'Unknown Goal'
          });
        }
        
        console.log('Formatted goal verifications:', formattedVerifications);
        setGoalVerifications(formattedVerifications);
      }

      // Fetch payment submissions
      console.log('Fetching payment submissions...');
      const { data: payments, error: paymentsError } = await supabase
        .from('payment_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
      } else {
        console.log('Payment submissions fetched:', payments);
        setPaymentSubmissions(payments || []);
      }

      // Fetch withdrawal requests
      console.log('Fetching withdrawal requests...');
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (withdrawalsError) {
        console.error('Error fetching withdrawals:', withdrawalsError);
      } else {
        console.log('Withdrawal requests fetched:', withdrawals);
        setWithdrawalRequests(withdrawals || []);
      }

      // Task completion submissions - placeholder for now
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
