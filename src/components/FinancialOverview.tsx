
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  description: string;
  target_amount: number | null;
  current_amount: number | null;
  deadline: string | null;
  status: string;
  created_at: string;
}

interface FinancialOverviewProps {
  goals: Goal[];
}

export const FinancialOverview = ({ goals }: FinancialOverviewProps) => {
  const totalEarned = goals.reduce((sum, goal) => sum + (goal.current_amount || 0), 0);
  const totalTarget = goals.reduce((sum, goal) => sum + (goal.target_amount || 0), 0);

  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center text-green-800">
          <TrendingUp className="h-6 w-6 mr-2" />
          Financial Progress Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">${totalEarned.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">${totalTarget.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Target</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {totalTarget > 0 ? Math.round((totalEarned / totalTarget) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Overall Progress</div>
          </div>
        </div>
        {totalTarget > 0 && (
          <div className="mt-4">
            <Progress 
              value={totalTarget > 0 ? (totalEarned / totalTarget) * 100 : 0} 
              className="h-3"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
