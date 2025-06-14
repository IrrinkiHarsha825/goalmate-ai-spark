
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, DollarSign, Trash2, ChevronDown, ChevronUp } from "lucide-react";

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

interface GoalCardProps {
  goal: Goal;
  isExpanded: boolean;
  onToggleExpansion: (goalId: string) => void;
  onDelete: (goalId: string) => void;
}

export const GoalCard = ({ goal, isExpanded, onToggleExpansion, onDelete }: GoalCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString();
  };

  const calculateProgress = (current: number | null, target: number | null) => {
    if (!current || !target) return 0;
    return Math.min((current / target) * 100, 100);
  };

  return (
    <Card className="border-purple-100 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{goal.title}</CardTitle>
            <Badge className={`mt-2 ${getStatusColor(goal.status)}`}>
              {goal.status}
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleExpansion(goal.id)}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(goal.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <CardDescription className="line-clamp-3">
          {goal.description}
        </CardDescription>

        {goal.target_amount && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                Money Progress (Auto-updated)
              </span>
              <span className="font-semibold text-green-600">
                ${goal.current_amount || 0} / ${goal.target_amount}
              </span>
            </div>
            <Progress 
              value={calculateProgress(goal.current_amount, goal.target_amount)} 
              className="h-2"
            />
            <div className="text-xs text-gray-500">
              Progress updates automatically when you complete tasks
            </div>
          </div>
        )}

        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          <span>Deadline: {formatDate(goal.deadline)}</span>
        </div>

        <div className="text-xs text-gray-500">
          Created: {formatDate(goal.created_at)}
        </div>
      </CardContent>
    </Card>
  );
};
