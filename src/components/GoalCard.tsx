
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, DollarSign, Target, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type Goal = Database['public']['Tables']['goals']['Row'];

interface GoalCardProps {
  goal: Goal;
  onView?: (goal: Goal) => void;
}

export const GoalCard = ({ goal, onView }: GoalCardProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">
          <Target className="w-3 h-3 mr-1" />
          Completed
        </Badge>;
      case 'failed':
        return <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          title: "🎉 Goal Completed!",
          message: "Congratulations! You've successfully completed this goal.",
          icon: <CheckCircle className="w-5 h-5 text-green-500" />
        };
      case 'failed':
        return {
          title: "❌ Goal Failed",
          message: "This goal was not completed within the deadline.",
          icon: <XCircle className="w-5 h-5 text-red-500" />
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusMessage(goal.status || 'active');
  const isCompleted = goal.status === 'completed';
  const isFailed = goal.status === 'failed';

  // Calculate progress (placeholder for now)
  const progress = isCompleted ? 100 : 45;

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${
      isCompleted ? 'border-green-200 bg-green-50' :
      isFailed ? 'border-red-200 bg-red-50' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg leading-tight flex items-center gap-2">
              {goal.title}
            </CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {goal.description}
            </CardDescription>
          </div>
          <div className="ml-3">
            {getStatusBadge(goal.status || 'active')}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Message */}
        {statusInfo && (
          <div className={`border rounded-lg p-3 ${
            isCompleted ? 'bg-green-50 border-green-200' :
            isFailed ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start space-x-3">
              {statusInfo.icon}
              <div className="flex-1">
                <h4 className={`font-medium text-sm ${
                  isCompleted ? 'text-green-900' :
                  isFailed ? 'text-red-900' : 'text-blue-900'
                }`}>
                  {statusInfo.title}
                </h4>
                <p className={`text-xs mt-1 ${
                  isCompleted ? 'text-green-700' :
                  isFailed ? 'text-red-700' : 'text-blue-700'
                }`}>
                  {statusInfo.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar (for active goals) */}
        {!isCompleted && !isFailed && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Goal Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {goal.target_amount && (
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">₹{Number(goal.target_amount).toLocaleString()}</span>
            </div>
          )}

          {goal.deadline && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-gray-600">
                {formatDistanceToNow(new Date(goal.deadline), { addSuffix: true })}
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {isCompleted ? (
            <Button 
              onClick={() => onView?.(goal)} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              View Completed Goal
            </Button>
          ) : isFailed ? (
            <Button 
              onClick={() => onView?.(goal)} 
              variant="outline"
              className="w-full border-red-300 text-red-700 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              View Failed Goal
            </Button>
          ) : (
            <Button 
              onClick={() => onView?.(goal)} 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Target className="w-4 h-4 mr-2" />
              View Goal
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
