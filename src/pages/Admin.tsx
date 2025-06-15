import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, DollarSign, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { AdminStatsCards } from "@/components/admin/AdminStatsCards";
import { PaymentSubmissionCard } from "@/components/admin/PaymentSubmissionCard";
import { WithdrawalRequestCard } from "@/components/admin/WithdrawalRequestCard";

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

const Admin = () => {
  const [paymentSubmissions, setPaymentSubmissions] = useState<PaymentSubmission[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check admin role from user metadata instead of database
    const userRole = user.user_metadata?.role || 'user';
    console.log('User role from metadata:', userRole);
    
    if (userRole !== 'admin') {
      navigate('/');
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      return;
    }
    
    fetchData();
  }, [user, navigate]);

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

  const handlePaymentAction = async (submissionId: string, action: 'approved' | 'rejected', notes?: string) => {
    setProcessingId(submissionId);
    try {
      console.log(`Processing payment ${submissionId} with action: ${action}`);
      
      const submission = paymentSubmissions.find(p => p.id === submissionId);
      if (!submission) {
        console.error('Submission not found:', submissionId);
        return;
      }

      // Update payment submission status
      console.log('Updating payment submission status...');
      const { error: submissionError } = await supabase
        .from('payment_submissions')
        .update({
          status: action,
          admin_notes: notes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', submissionId);

      if (submissionError) {
        console.error('Error updating payment submission:', submissionError);
        throw submissionError;
      }

      if (action === 'approved') {
        console.log('Payment approved, activating goal and updating wallet...');
        
        // Activate the goal when payment is approved (change from 'inactive' to 'active')
        const { error: goalError } = await supabase
          .from('goals')
          .update({ status: 'active' })
          .eq('id', submission.goal_id);

        if (goalError) {
          console.error('Error activating goal:', goalError);
          throw goalError;
        }

        // Update or create wallet with the investment amount
        const { data: existingWallet, error: walletFetchError } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', submission.user_id)
          .single();

        if (walletFetchError && walletFetchError.code !== 'PGRST116') {
          console.error('Error fetching wallet:', walletFetchError);
          throw walletFetchError;
        }

        if (existingWallet) {
          console.log('Updating existing wallet...');
          const { error: walletError } = await supabase
            .from('wallets')
            .update({
              balance: Number(existingWallet.balance) + Number(submission.amount),
              total_invested: Number(existingWallet.total_invested) + Number(submission.amount),
            })
            .eq('user_id', submission.user_id);

          if (walletError) {
            console.error('Error updating wallet:', walletError);
            throw walletError;
          }
        } else {
          console.log('Creating new wallet...');
          const { error: walletError } = await supabase
            .from('wallets')
            .insert({
              user_id: submission.user_id,
              balance: submission.amount,
              total_invested: submission.amount,
            });

          if (walletError) {
            console.error('Error creating wallet:', walletError);
            throw walletError;
          }
        }
      } else {
        console.log('Payment rejected, keeping goal inactive...');
        // If rejected, keep goal inactive or set it to rejected
        const { error: goalError } = await supabase
          .from('goals')
          .update({ status: 'inactive' })
          .eq('id', submission.goal_id);

        if (goalError) {
          console.error('Error updating goal status:', goalError);
          throw goalError;
        }
      }

      toast({
        title: action === 'approved' ? "Payment Approved" : "Payment Rejected",
        description: `Payment submission has been ${action}${action === 'approved' ? ' and goal activated' : ''}`,
      });

      console.log('Action completed, refreshing data...');
      // Refresh the data to show updated list
      await fetchData();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleWithdrawalAction = async (requestId: string, action: 'approved' | 'rejected', notes?: string) => {
    setProcessingId(requestId);
    try {
      const request = withdrawalRequests.find(w => w.id === requestId);
      if (!request) return;

      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: action,
          admin_notes: notes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', requestId);

      if (error) throw error;

      if (action === 'approved') {
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', request.user_id)
          .single();

        if (wallet) {
          const { error: updateError } = await supabase
            .from('wallets')
            .update({ balance: Number(wallet.balance) - Number(request.amount) })
            .eq('user_id', request.user_id);

          if (updateError) throw updateError;
        }
      }

      toast({
        title: action === 'approved' ? "Withdrawal Approved" : "Withdrawal Rejected",
        description: `Withdrawal request has been ${action}`,
      });

      fetchData();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast({
        title: "Error",
        description: "Failed to process withdrawal",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const pendingPayments = paymentSubmissions.filter(p => p.status === 'pending').length;
  const pendingWithdrawals = withdrawalRequests.filter(w => w.status === 'pending').length;
  const totalRequests = paymentSubmissions.length + withdrawalRequests.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-100">
      <AdminNavigation userEmail={user?.email} onSignOut={handleSignOut} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Administration Dashboard</h1>
          <p className="text-gray-600">Manage payments, withdrawals, and user requests</p>
        </div>

        <AdminStatsCards 
          pendingPayments={pendingPayments}
          pendingWithdrawals={pendingWithdrawals}
          totalRequests={totalRequests}
        />

        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-red-100">
            <TabsTrigger value="payments" className="flex items-center space-x-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <FileText className="h-4 w-4" />
              <span>Payment Submissions</span>
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center space-x-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <DollarSign className="h-4 w-4" />
              <span>Withdrawal Requests</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-4">
            {paymentSubmissions.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-600">
                  No payment submissions found
                </CardContent>
              </Card>
            ) : (
              paymentSubmissions.map((submission) => (
                <PaymentSubmissionCard
                  key={submission.id}
                  submission={submission}
                  onAction={handlePaymentAction}
                  processing={processingId === submission.id}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="withdrawals" className="space-y-4">
            {withdrawalRequests.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-600">
                  No withdrawal requests found
                </CardContent>
              </Card>
            ) : (
              withdrawalRequests.map((request) => (
                <WithdrawalRequestCard
                  key={request.id}
                  request={request}
                  onAction={handleWithdrawalAction}
                  processing={processingId === request.id}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
