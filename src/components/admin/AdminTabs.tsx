import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, DollarSign, CheckSquare } from "lucide-react";
import { PaymentSubmissionCard } from "@/components/admin/PaymentSubmissionCard";
import { WithdrawalRequestCard } from "@/components/admin/WithdrawalRequestCard";
import { TaskCompletionCard } from "@/components/admin/TaskCompletionCard";

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

interface AdminTabsProps {
  paymentSubmissions: PaymentSubmission[];
  withdrawalRequests: WithdrawalRequest[];
  taskCompletionSubmissions: TaskCompletionSubmission[];
  onPaymentAction: (id: string, action: 'approved' | 'rejected', notes?: string) => void;
  onWithdrawalAction: (id: string, action: 'approved' | 'rejected', notes?: string) => void;
  onTaskCompletionAction: (id: string, action: 'approved' | 'rejected', notes?: string) => void;
  processingId: string | null;
}

export const AdminTabs = ({
  paymentSubmissions,
  withdrawalRequests,
  taskCompletionSubmissions,
  onPaymentAction,
  onWithdrawalAction,
  onTaskCompletionAction,
  processingId
}: AdminTabsProps) => {
  return (
    <Tabs defaultValue="task-completions" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 bg-red-100">
        <TabsTrigger value="task-completions" className="flex items-center space-x-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
          <CheckSquare className="h-4 w-4" />
          <span>Task Completions</span>
        </TabsTrigger>
        <TabsTrigger value="payments" className="flex items-center space-x-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
          <FileText className="h-4 w-4" />
          <span>Payment Submissions</span>
        </TabsTrigger>
        <TabsTrigger value="withdrawals" className="flex items-center space-x-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
          <DollarSign className="h-4 w-4" />
          <span>Withdrawal Requests</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="task-completions" className="space-y-4">
        {taskCompletionSubmissions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-600">
              No task completion submissions found
            </CardContent>
          </Card>
        ) : (
          taskCompletionSubmissions.map((submission) => (
            <TaskCompletionCard
              key={submission.id}
              submission={submission}
              onAction={onTaskCompletionAction}
              processing={processingId === submission.id}
            />
          ))
        )}
      </TabsContent>

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
