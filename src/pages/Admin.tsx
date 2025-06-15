
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, LogOut, Check, X, DollarSign, FileText, Shield } from "lucide-react";
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

    // Check if user is admin
    const checkAdminRole = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || data?.role !== 'admin') {
        navigate('/');
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        return;
      }
      
      fetchData();
    };

    checkAdminRole();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch payment submissions
      const { data: payments, error: paymentsError } = await supabase
        .from('payment_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (paymentsError) throw paymentsError;
      setPaymentSubmissions(payments || []);

      // Fetch withdrawal requests
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (withdrawalsError) throw withdrawalsError;
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
      const submission = paymentSubmissions.find(p => p.id === submissionId);
      if (!submission) return;

      // Update payment submission status
      const { error } = await supabase
        .from('payment_submissions')
        .update({
          status: action,
          admin_notes: notes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', submissionId);

      if (error) throw error;

      // If approved, update user's wallet
      if (action === 'approved') {
        const { error: walletError } = await supabase
          .from('wallets')
          .update({
            balance: submission.amount,
            total_invested: submission.amount,
          })
          .eq('user_id', submission.user_id);

        if (walletError) throw walletError;
      }

      toast({
        title: action === 'approved' ? "Payment Approved" : "Payment Rejected",
        description: `Payment submission has been ${action}`,
      });

      fetchData();
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

      // Update withdrawal request status
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

      // If approved, deduct from user's wallet balance
      if (action === 'approved') {
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', request.user_id)
          .single();

        if (wallet) {
          const { error: updateError } = await supabase
            .from('wallets')
            .update({ balance: wallet.balance - request.amount })
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-100">
      {/* Admin Navigation */}
      <nav className="bg-red-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-white" />
              <span className="text-2xl font-bold text-white">
                Admin Panel
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Administrator
              </Badge>
              <span className="text-white text-sm">{user?.email}</span>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="border-white text-white hover:bg-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Administration Dashboard</h1>
          <p className="text-gray-600">Manage payments, withdrawals, and user requests</p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {paymentSubmissions.filter(p => p.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {withdrawalRequests.filter(w => w.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {paymentSubmissions.length + withdrawalRequests.length}
              </div>
            </CardContent>
          </Card>
        </div>

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

const PaymentSubmissionCard = ({ 
  submission, 
  onAction, 
  processing 
}: { 
  submission: PaymentSubmission; 
  onAction: (id: string, action: 'approved' | 'rejected', notes?: string) => void;
  processing: boolean;
}) => {
  const [notes, setNotes] = useState(submission.admin_notes || "");

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Payment Submission</CardTitle>
            <CardDescription>
              User ID: {submission.user_id}
            </CardDescription>
          </div>
          <Badge variant={submission.status === 'pending' ? 'secondary' : 
                         submission.status === 'approved' ? 'default' : 'destructive'}>
            {submission.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Amount</p>
            <p className="text-lg font-bold text-green-600">₹{submission.amount}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Transaction ID</p>
            <p className="font-mono text-sm">{submission.transaction_id}</p>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium mb-2">Submitted</p>
          <p className="text-sm text-gray-600">
            {new Date(submission.submitted_at).toLocaleString()}
          </p>
        </div>

        {submission.status === 'pending' && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Admin Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes (optional)"
                className="mt-1"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => onAction(submission.id, 'approved', notes)}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => onAction(submission.id, 'rejected', notes)}
                disabled={processing}
                variant="destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        )}

        {submission.admin_notes && (
          <div>
            <p className="text-sm font-medium">Admin Notes</p>
            <p className="text-sm text-gray-600">{submission.admin_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const WithdrawalRequestCard = ({ 
  request, 
  onAction, 
  processing 
}: { 
  request: WithdrawalRequest; 
  onAction: (id: string, action: 'approved' | 'rejected', notes?: string) => void;
  processing: boolean;
}) => {
  const [notes, setNotes] = useState(request.admin_notes || "");

  return (
    <Card className="border-l-4 border-l-yellow-500">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Withdrawal Request</CardTitle>
            <CardDescription>
              User ID: {request.user_id}
            </CardDescription>
          </div>
          <Badge variant={request.status === 'pending' ? 'secondary' : 
                         request.status === 'approved' ? 'default' : 'destructive'}>
            {request.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Amount</p>
            <p className="text-lg font-bold text-green-600">₹{request.amount}</p>
          </div>
          <div>
            <p className="text-sm font-medium">UPI ID</p>
            <p className="font-mono text-sm">{request.upi_id}</p>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium mb-2">Requested</p>
          <p className="text-sm text-gray-600">
            {new Date(request.requested_at).toLocaleString()}
          </p>
        </div>

        {request.status === 'pending' && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Admin Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes (optional)"
                className="mt-1"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => onAction(request.id, 'approved', notes)}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => onAction(request.id, 'rejected', notes)}
                disabled={processing}
                variant="destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        )}

        {request.admin_notes && (
          <div>
            <p className="text-sm font-medium">Admin Notes</p>
            <p className="text-sm text-gray-600">{request.admin_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Admin;
