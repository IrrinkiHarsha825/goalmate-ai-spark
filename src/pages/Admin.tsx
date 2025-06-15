
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
import { Card, CardContent } from "@/components/ui/card";
import { CheckSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
    // TODO: Implement this when task_completion_submissions table exists
    toast({
      title: "Feature Coming Soon",
      description: "Task completion review will be available after database setup",
    });
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
