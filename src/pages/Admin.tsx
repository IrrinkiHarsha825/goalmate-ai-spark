
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

const Admin = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { 
    paymentSubmissions, 
    withdrawalRequests, 
    loading, 
    fetchData,
    updatePaymentSubmissionStatus,
    updateWithdrawalRequestStatus
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

  if (loading) {
    return <AdminLoadingScreen />;
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

        <AdminTabs
          paymentSubmissions={paymentSubmissions}
          withdrawalRequests={withdrawalRequests}
          onPaymentAction={handlePaymentAction}
          onWithdrawalAction={handleWithdrawalAction}
          processingId={processingId}
        />
      </div>
    </div>
  );
};

export default Admin;
