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
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [taskCompletionSubmissions, setTaskCompletionSubmissions] = useState<TaskCompletionSubmission[]>([]);
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

      console.log('Fetching task completion submissions...');
      const { data: taskCompletions, error: taskCompletionsError } = await supabase
        .from('task_completion_submissions')
        .select(`
          *,
          tasks(title),
          goals(title),
          profiles(email)
        `)
        .order('submitted_at', { ascending: false });

      if (taskCompletionsError) {
        console.error('Error fetching task completions:', taskCompletionsError);
        throw taskCompletionsError;
      }
      
      // Transform the data to flatten joined fields
      const formattedTaskCompletions = (taskCompletions || []).map(tc => ({
        ...tc,
        task_title: tc.tasks?.title,
        user_email: tc.profiles?.email,
        goal_title: tc.goals?.title
      }));
      
      console.log('Task completion submissions fetched:', formattedTaskCompletions);
      setTaskCompletionSubmissions(formattedTaskCompletions);
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
    withdrawalRequests,
    taskCompletionSubmissions,
    loading,
    fetchData,
    updatePaymentSubmissionStatus,
    updateWithdrawalRequestStatus,
    updateTaskCompletionSubmissionStatus
  };
};
