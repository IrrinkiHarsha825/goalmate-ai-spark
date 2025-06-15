import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { AdminStatsCards } from "@/components/admin/AdminStatsCards";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { AdminLoadingScreen } from "@/components/admin/AdminLoadingScreen";
import { useAdminData } from "@/hooks/useAdminData";
import { useAdminActions } from "@/hooks/useAdminActions";
import { Card, CardContent, CheckSquare } from "@chakra-ui/react";

const Admin = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { 
    paymentSubmissions, 
    withdrawalRequests,
    taskCompletionSubmissions,
    loading, 
    fetchData,
    updatePaymentSubmissionStatus,
    updateWithdrawalRequestStatus,
    updateTaskCompletionSubmissionStatus
  } = useAdminData();
  
  const { processingId, handlePaymentAction, handleWithdrawalAction } = useAdminActions(
    fetchData,
    updatePaymentSubmissionStatus,
    updateWithdrawalRequestStatus
  );

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
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleTaskCompletionAction = async (id: string, action: 'approved' | 'rejected', notes?: string) => {
    try {
      const submission = taskCompletionSubmissions.find(s => s.id === id);
      if (!submission) return;

      // Update the task completion submission
      const { error: updateError } = await supabase
        .from('task_completion_submissions')
        .update({
          status: action,
          admin_notes: notes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', id);

      if (updateError) throw updateError;

      if (action === 'approved') {
        // Update user's wallet balance
        const { data: wallet, error: walletFetchError } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', submission.user_id)
          .single();

        if (walletFetchError) {
          // Create wallet if it doesn't exist
          const { error: walletCreateError } = await supabase
            .from('wallets')
            .insert({
              user_id: submission.user_id,
              balance: submission.reward_amount,
              total_invested: 0
            });

          if (walletCreateError) throw walletCreateError;
        } else {
          // Update existing wallet
          const { error: walletUpdateError } = await supabase
            .from('wallets')
            .update({
              balance: (wallet.balance || 0) + submission.reward_amount
            })
            .eq('user_id', submission.user_id);

          if (walletUpdateError) throw walletUpdateError;
        }

        // Update goal's current amount
        const { error: goalUpdateError } = await supabase
          .from('goals')
          .update({
            current_amount: supabase.sql`current_amount + ${submission.reward_amount}`
          })
          .eq('id', submission.goal_id);

        if (goalUpdateError) throw goalUpdateError;

        // Mark the task as completed
        const { error: taskUpdateError } = await supabase
          .from('tasks')
          .update({ completed: true })
          .eq('id', submission.task_id);

        if (taskUpdateError) throw taskUpdateError;
      }

      // Update local state
      updateTaskCompletionSubmissionStatus(id, action, notes);

      toast({
        title: action === 'approved' ? "Task Completion Approved" : "Task Completion Rejected",
        description: action === 'approved' 
          ? `Payment of $${submission.reward_amount} has been credited to user's wallet`
          : "Task completion has been rejected",
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error handling task completion action:', error);
      toast({
        title: "Error",
        description: "Failed to process task completion",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <AdminLoadingScreen />;
  }

  const pendingPayments = paymentSubmissions.filter(p => p.status === 'pending').length;
  const pendingWithdrawals = withdrawalRequests.filter(w => w.status === 'pending').length;
  const pendingTaskCompletions = taskCompletionSubmissions.filter(t => t.status === 'pending').length;
  const totalRequests = paymentSubmissions.length + withdrawalRequests.length + taskCompletionSubmissions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-100">
      <AdminNavigation userEmail={user?.email} onSignOut={handleSignOut} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Administration Dashboard</h1>
          <p className="text-gray-600">Manage payments, withdrawals, and task completions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckSquare className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{pendingTaskCompletions}</p>
                  <p className="text-sm text-gray-600">Pending Task Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <AdminStatsCards 
            pendingPayments={pendingPayments}
            pendingWithdrawals={pendingWithdrawals}
            totalRequests={totalRequests}
          />
        </div>

        <AdminTabs
          paymentSubmissions={paymentSubmissions}
          withdrawalRequests={withdrawalRequests}
          taskCompletionSubmissions={taskCompletionSubmissions}
          onPaymentAction={handlePaymentAction}
          onWithdrawalAction={handleWithdrawalAction}
          onTaskCompletionAction={handleTaskCompletionAction}
          processingId={processingId}
        />
      </div>
    </div>
  );
};

export default Admin;
