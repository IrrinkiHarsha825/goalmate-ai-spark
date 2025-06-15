
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminStatsCardsProps {
  pendingPayments: number;
  pendingWithdrawals: number;
  totalRequests: number;
}

export const AdminStatsCards = ({ 
  pendingPayments, 
  pendingWithdrawals, 
  totalRequests 
}: AdminStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="border-red-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Pending Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {pendingPayments}
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-orange-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Pending Withdrawals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {pendingWithdrawals}
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {totalRequests}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
