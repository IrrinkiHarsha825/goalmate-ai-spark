
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, DollarSign } from "lucide-react";
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

interface AdminTabsProps {
  paymentSubmissions: PaymentSubmission[];
  withdrawalRequests: WithdrawalRequest[];
  onPaymentAction: (id: string, action: 'approved' | 'rejected', notes?: string) => void;
  onWithdrawalAction: (id: string, action: 'approved' | 'rejected', notes?: string) => void;
  processingId: string | null;
}

export const AdminTabs = ({
  paymentSubmissions,
  withdrawalRequests,
  onPaymentAction,
  onWithdrawalAction,
  processingId
}: AdminTabsProps) => {
  return (
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
              onAction={onPaymentAction}
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
              onAction={onWithdrawalAction}
              processing={processingId === request.id}
            />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
};
