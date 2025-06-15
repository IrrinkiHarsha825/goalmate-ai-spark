
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, DollarSign, Target, AlertCircle, CheckCircle, XCircle } from "lucide-react";
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
      case 'pending_payment':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800">
          <Clock className="w-3 h-3 mr-1" />
          Payment Pending
        </Badge>;
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
      case 'pending_payment':
        return {
          title: "Payment Verification Required",
          message: "Your goal is waiting for admin to verify your payment submission.",
          icon: <AlertCircle className="w-5 h-5 text-amber-500" />
        };
      case 'active':
        return null;
      default:
        return null;
    }
  };

  const statusInfo = getStatusMessage(goal.status || 'active');
  const isLocked = goal.status === 'pending_payment';

  // Calculate progress (placeholder for now)
  const progress = goal.status === 'completed' ? 100 : 
                  goal.status === 'active' ? 45 : 0;

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${isLocked ? 'opacity-75' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg leading-tight">{goal.title}</CardTitle>
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
        {/* Status Message for Locked Goals */}
        {statusInfo && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start space-x-3">
              {statusInfo.icon}
              <div className="flex-1">
                <h4 className="font-medium text-amber-900 text-sm">{statusInfo.title}</h4>
                <p className="text-amber-700 text-xs mt-1">{statusInfo.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar (only for active goals) */}
        {goal.status === 'active' && (
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
          {isLocked ? (
            <Button 
              variant="outline" 
              className="w-full" 
              disabled
            >
              <Clock className="w-4 h-4 mr-2" />
              Waiting for Payment Approval
            </Button>
          ) : (
            <Button 
              onClick={() => onView?.(goal)} 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              View Goal
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
