
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, LogOut, Check, X, DollarSign, Users, FileText } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Target className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                GoalMate Admin
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin: {user?.email}</span>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage payment submissions and withdrawal requests</p>
        </div>

        <Tabs defaultValue="payments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payments" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Payment Submissions</span>
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center space-x-2">
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
    <Card>
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
    <Card>
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
