import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AdminLoadingScreen } from "@/components/admin/AdminLoadingScreen";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { AdminStatsCards } from "@/components/admin/AdminStatsCards";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { PaymentSubmissionCard } from "@/components/admin/PaymentSubmissionCard";
import { GoalVerificationCard } from "@/components/admin/GoalVerificationCard";
import { WithdrawalRequestCard } from "@/components/admin/WithdrawalRequestCard";
import { TaskCompletionCard } from "@/components/admin/TaskCompletionCard";
import { useAdminData } from "@/hooks/useAdminData";
import { useAdminActions } from "@/hooks/useAdminActions";
import { Tabs, TabsContent } from "@/components/ui/tabs";

const Admin = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const {
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
  } = useAdminData();

  const { processingId, handlePaymentAction, handleWithdrawalAction, handleGoalVerificationAction } = useAdminActions(
    fetchData,
    updatePaymentSubmissionStatus,
    updateWithdrawalRequestStatus
  );

  useEffect(() => {
    const checkUserRole = async () => {
      setRoleLoading(true);
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error("Error fetching user role:", error);
            setUserRole(null);
          } else {
            setUserRole(data?.role || null);
          }
        } catch (error) {
          console.error("Unexpected error fetching user role:", error);
          setUserRole(null);
        } finally {
          setRoleLoading(false);
        }
      } else {
        setUserRole(null);
        setRoleLoading(false);
      }
    };

    checkUserRole();
  }, [user]);

  if (authLoading || roleLoading || loading) {
    return <AdminLoadingScreen />;
  }

  if (!user || userRole !== 'admin') {
    return <Navigate to="/auth" replace />;
  }

  const totalPendingPayments = paymentSubmissions.filter(p => p.status === 'pending').length;
  const totalPendingVerifications = goalVerifications.filter(v => v.verification_status === 'pending').length;
  const totalPendingWithdrawals = withdrawalRequests.filter(w => w.status === 'pending').length;
  const totalPendingTasks = taskCompletionSubmissions.filter(t => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <AdminNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage payments, verifications, and user requests</p>
        </div>

        <AdminStatsCards 
          totalPendingPayments={totalPendingPayments}
          totalPendingVerifications={totalPendingVerifications}
          totalPendingWithdrawals={totalPendingWithdrawals}
          totalPendingTasks={totalPendingTasks}
        />

        <Tabs defaultValue="verifications" className="w-full">
          <AdminTabs />
          
          <TabsContent value="verifications" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Goal Payment Verifications</h2>
              <span className="text-sm text-gray-500">
                {goalVerifications.length} total verifications
              </span>
            </div>
            
            {goalVerifications.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">No payment verifications found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {goalVerifications.map((verification) => (
                  <GoalVerificationCard
                    key={verification.id}
                    verification={verification}
                    onAction={handleGoalVerificationAction}
                    processing={processingId === verification.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Payment Submissions (Legacy)</h2>
              <span className="text-sm text-gray-500">
                {paymentSubmissions.length} total submissions
              </span>
            </div>
            
            {paymentSubmissions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">No payment submissions found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentSubmissions.map((submission) => (
                  <PaymentSubmissionCard
                    key={submission.id}
                    submission={submission}
                    onAction={handlePaymentAction}
                    processing={processingId === submission.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="withdrawals" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Withdrawal Requests</h2>
              <span className="text-sm text-gray-500">
                {withdrawalRequests.length} total requests
              </span>
            </div>
            
            {withdrawalRequests.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">No withdrawal requests found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawalRequests.map((request) => (
                  <WithdrawalRequestCard
                    key={request.id}
                    request={request}
                    onAction={handleWithdrawalAction}
                    processing={processingId === request.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Task Completion Submissions</h2>
              <span className="text-sm text-gray-500">
                {taskCompletionSubmissions.length} total submissions
              </span>
            </div>
            
            {taskCompletionSubmissions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">No task completion submissions found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {taskCompletionSubmissions.map((submission) => (
                  <TaskCompletionCard
                    key={submission.id}
                    submission={submission}
                    onAction={(id, action, notes) => {
                      updateTaskCompletionSubmissionStatus(id, action, notes);
                    }}
                    processing={processingId === submission.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
