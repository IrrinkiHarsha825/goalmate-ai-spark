import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, DollarSign, Calendar, Target, Zap, Shield, QrCode, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PaymentSubmissionModal } from "./PaymentSubmissionModal";

interface GoalCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalCreated?: () => void;
}

export const GoalCreationModal = ({
  open,
  onOpenChange,
  onGoalCreated
}: GoalCreationModalProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdGoalId, setCreatedGoalId] = useState<string | null>(null);
  const [goalData, setGoalData] = useState({
    title: "",
    description: "",
    category: "",
    deadline: "",
    commitmentAmount: "",
    upiId: "",
    mode: "normal"
  });
  const [aiBreakdown, setAiBreakdown] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleNextStep = () => {
    if (step === 1 && goalData.title && goalData.description) {
      // Simulate AI breakdown
      const breakdown = [
        "Week 1-2: Research and gather learning resources",
        "Week 3-6: Complete foundational courses and tutorials", 
        "Week 7-10: Build 3 practice projects",
        "Week 11-12: Create portfolio and apply for opportunities"
      ];
      setAiBreakdown(breakdown);
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleCreateGoal = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create goals",
        variant: "destructive",
      });
      return;
    }

    if (!goalData.commitmentAmount) {
      toast({
        title: "Error", 
        description: "Please enter a commitment amount",
        variant: "destructive"
      });
      return;
    }

    if (!goalData.upiId) {
      toast({
        title: "Error",
        description: "Please enter your UPI ID for money back",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create the goal with 'inactive' status instead of 'pending_payment'
      const { data: goal, error: goalError } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: goalData.title,
          description: goalData.description,
          target_amount: parseFloat(goalData.commitmentAmount),
          deadline: goalData.deadline || null,
          status: 'inactive' // Using 'inactive' instead of 'pending_payment'
        })
        .select()
        .single();

      if (goalError) throw goalError;

      setCreatedGoalId(goal.id);
      
      // Show payment submission modal
      setShowPaymentModal(true);

      toast({
        title: "Goal Created!",
        description: "Now complete your payment to activate your goal",
      });

    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmitted = () => {
    // Reset form and close modals
    setGoalData({
      title: "",
      description: "",
      category: "",
      deadline: "",
      commitmentAmount: "",
      upiId: "",
      mode: "normal"
    });
    setStep(1);
    setShowPaymentModal(false);
    setCreatedGoalId(null);
    onOpenChange(false);

    // Notify parent component
    if (onGoalCreated) {
      onGoalCreated();
    }

    toast({
      title: "Payment Submitted! ⏳",
      description: "Your goal will be activated once admin approves your payment",
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Create Your Goal
            </DialogTitle>
            <DialogDescription>
              Let's break down your goal into achievable steps and set up your commitment system.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i <= step ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {i}
                  </div>
                  {i < 3 && (
                    <div className={`w-12 h-1 mx-2 ${i < step ? 'bg-purple-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Goal Definition */}
            {step === 1 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="mr-2 h-5 w-5 text-purple-600" />
                      Define Your Goal
                    </CardTitle>
                    <CardDescription>
                      Be specific and ambitious. What do you want to achieve?
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="goal-title">Goal Title</Label>
                      <Input 
                        id="goal-title" 
                        placeholder="e.g., Learn Full Stack Web Development" 
                        value={goalData.title}
                        onChange={(e) => setGoalData({ ...goalData, title: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="goal-description">Detailed Description</Label>
                      <Textarea 
                        id="goal-description" 
                        placeholder="Describe what you want to achieve, why it matters to you, and what success looks like..." 
                        value={goalData.description}
                        onChange={(e) => setGoalData({ ...goalData, description: e.target.value })}
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="goal-category">Category</Label>
                      <Select value={goalData.category} onValueChange={(value) => setGoalData({ ...goalData, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="career">Career & Skills</SelectItem>
                          <SelectItem value="health">Health & Fitness</SelectItem>
                          <SelectItem value="education">Education & Learning</SelectItem>
                          <SelectItem value="business">Business & Entrepreneurship</SelectItem>
                          <SelectItem value="personal">Personal Development</SelectItem>
                          <SelectItem value="habits">Habits & Lifestyle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleNextStep} 
                    disabled={!goalData.title || !goalData.description}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Next: AI Breakdown
                    <Brain className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: AI Breakdown */}
            {step === 2 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="mr-2 h-5 w-5 text-purple-600" />
                      AI-Generated Roadmap
                    </CardTitle>
                    <CardDescription>
                      Based on your goal, here's a personalized breakdown of steps to achieve it.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {aiBreakdown.map((step, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                          <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <p className="text-gray-700 flex-1">{step}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Zap className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-900">AI Insights</span>
                      </div>
                      <p className="text-blue-800 text-sm">
                        This goal typically takes 12 weeks to complete with 10-15 hours per week of dedicated effort. 
                        Success rate increases by 73% when combined with financial commitment.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleNextStep}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Next: Commitment
                    <DollarSign className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Commitment Setup */}
            {step === 3 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="mr-2 h-5 w-5 text-purple-600" />
                      Commitment System
                    </CardTitle>
                    <CardDescription>
                      Put money on the line to stay motivated. Get it back (plus bonuses) when you succeed.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="deadline">Deadline</Label>
                        <Input 
                          id="deadline" 
                          type="date" 
                          value={goalData.deadline}
                          onChange={(e) => setGoalData({ ...goalData, deadline: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="commitment">Commitment Amount (₹)</Label>
                        <Input 
                          id="commitment" 
                          type="number" 
                          placeholder="e.g., 1000" 
                          value={goalData.commitmentAmount}
                          onChange={(e) => setGoalData({ ...goalData, commitmentAmount: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="upi-id">Your UPI ID (for money back)</Label>
                      <Input 
                        id="upi-id" 
                        placeholder="e.g., yourname@paytm, yourname@googlepay" 
                        value={goalData.upiId}
                        onChange={(e) => setGoalData({ ...goalData, upiId: e.target.value })}
                      />
                      <p className="text-sm text-gray-500 mt-1">We'll send your money back to this UPI ID when you complete your goal</p>
                    </div>
                    
                    <div>
                      <Label>Commitment Mode</Label>
                      <div className="grid md:grid-cols-2 gap-4 mt-2">
                        <Card 
                          className={`cursor-pointer transition-all ${
                            goalData.mode === 'normal' ? 'ring-2 ring-purple-600 bg-purple-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setGoalData({ ...goalData, mode: 'normal' })}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium">Normal Mode</h3>
                              <Badge className="bg-green-100 text-green-800">Flexible</Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              Can opt-out anytime with partial refund based on progress. Lower risk, moderate rewards.
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card 
                          className={`cursor-pointer transition-all ${
                            goalData.mode === 'hard' ? 'ring-2 ring-purple-600 bg-purple-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setGoalData({ ...goalData, mode: 'hard' })}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium">Hard Mode</h3>
                              <Badge className="bg-red-100 text-red-800">Committed</Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              Cannot cancel until deadline. Higher penalties for failure, but bigger rewards for success.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="h-5 w-5 text-amber-600" />
                        <span className="font-medium text-amber-900">Payment Required</span>
                      </div>
                      <p className="text-amber-800 text-sm">
                        Simply submit your transaction ID after making the payment. Admin will verify and activate your goal.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleCreateGoal} 
                    disabled={loading || !goalData.commitmentAmount || !goalData.upiId}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {loading ? "Creating Goal..." : "Create Goal & Pay"}
                    <Target className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Submission Modal */}
      {createdGoalId && (
        <PaymentSubmissionModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          goalId={createdGoalId}
          amount={parseFloat(goalData.commitmentAmount || "0")}
          onPaymentSubmitted={handlePaymentSubmitted}
        />
      )}
    </>
  );
};
