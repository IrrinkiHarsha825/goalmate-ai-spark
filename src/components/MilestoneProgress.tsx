
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Trophy, Target, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Milestone {
  id: string;
  milestone_percentage: number;
  reward_amount: number;
  achieved: boolean;
  achieved_at: string | null;
}

interface MilestoneProgressProps {
  goalId: string;
  currentProgress: number;
  targetAmount: number;
  totalEarned: number;
}

export const MilestoneProgress = ({ 
  goalId, 
  currentProgress, 
  targetAmount, 
  totalEarned 
}: MilestoneProgressProps) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  const progressPercentage = targetAmount > 0 ? (currentProgress / targetAmount) * 100 : 0;

  useEffect(() => {
    fetchMilestones();
  }, [goalId]);

  const fetchMilestones = async () => {
    try {
      // For now, create mock milestones until the database is updated
      const mockMilestones: Milestone[] = [
        { id: '1', milestone_percentage: 25, reward_amount: 50, achieved: progressPercentage >= 25, achieved_at: null },
        { id: '2', milestone_percentage: 50, reward_amount: 50, achieved: progressPercentage >= 50, achieved_at: null },
        { id: '3', milestone_percentage: 75, reward_amount: 50, achieved: progressPercentage >= 75, achieved_at: null },
        { id: '4', milestone_percentage: 100, reward_amount: 50, achieved: progressPercentage >= 100, achieved_at: null }
      ];
      
      setMilestones(mockMilestones);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMilestoneStatus = (percentage: number) => {
    if (progressPercentage >= percentage) {
      return 'achieved';
    } else if (progressPercentage >= percentage - 10) {
      return 'near';
    }
    return 'pending';
  };

  const totalCommitment = milestones.reduce((sum, m) => sum + m.reward_amount, 0);
  const earnedFromMilestones = milestones
    .filter(m => m.achieved)
    .reduce((sum, m) => sum + m.reward_amount, 0);
  const remainingRewards = totalCommitment - earnedFromMilestones;

  if (loading) return null;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Achievement Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-green-600">${totalEarned}</div>
            <div className="text-xs text-gray-600">Total Earned</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-blue-600">${remainingRewards}</div>
            <div className="text-xs text-gray-600">Remaining</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-purple-600">${totalCommitment}</div>
            <div className="text-xs text-gray-600">Total Commitment</div>
          </div>
        </div>

        {/* Milestone Cards */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Reward Milestones</h4>
          <div className="grid gap-3">
            {milestones.map((milestone) => {
              const status = getMilestoneStatus(milestone.milestone_percentage);
              const isAchieved = milestone.achieved;
              
              return (
                <div 
                  key={milestone.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isAchieved 
                      ? 'border-green-200 bg-green-50' 
                      : status === 'near'
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isAchieved ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <Target className="h-6 w-6 text-gray-400" />
                      )}
                      <div>
                        <div className="font-medium">
                          {milestone.milestone_percentage}% Progress
                        </div>
                        <div className="text-sm text-gray-600">
                          {isAchieved 
                            ? `Achieved on ${new Date().toLocaleDateString()}`
                            : `${targetAmount * (milestone.milestone_percentage / 100)} target needed`
                          }
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-green-600 font-bold">
                        <DollarSign className="h-4 w-4" />
                        {milestone.reward_amount}
                      </div>
                      <Badge 
                        variant={isAchieved ? "default" : status === 'near' ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {isAchieved ? "Earned" : status === 'near' ? "Almost There!" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Milestone Info */}
        {progressPercentage < 100 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800 mb-2">
              <Target className="h-4 w-4" />
              <span className="font-medium">Next Milestone</span>
            </div>
            {(() => {
              const nextMilestone = milestones.find(m => !m.achieved);
              if (nextMilestone) {
                const needed = (targetAmount * (nextMilestone.milestone_percentage / 100)) - currentProgress;
                return (
                  <div className="text-sm text-blue-700">
                    <div>Target: {nextMilestone.milestone_percentage}% progress</div>
                    <div>Reward: ${nextMilestone.reward_amount}</div>
                    <div className="font-medium">You need ${needed.toFixed(2)} more to unlock this reward!</div>
                  </div>
                );
              }
              return <div className="text-sm text-blue-700">All milestones achieved! 🎉</div>;
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
