
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Target, Brain, Shield, Users, TrendingUp, Clock, Gift, Zap } from "lucide-react";
import { HeroSection } from "@/components/HeroSection";
import { FeatureCard } from "@/components/FeatureCard";
import { StatsSection } from "@/components/StatsSection";
import { TestimonialSection } from "@/components/TestimonialSection";
import { GoalCreationModal } from "@/components/GoalCreationModal";

const Index = () => {
  const [showGoalModal, setShowGoalModal] = useState(false);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Goal Breakdown",
      description: "Let our AI assistant break down your goals into manageable, actionable steps with personalized guidance."
    },
    {
      icon: Shield,
      title: "Smart Commitment System",
      description: "Put money on the line. Complete your goals and get rewarded. Give up early and face consequences."
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Visual progress charts, streak counters, and detailed analytics to keep you motivated."
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Join communities, share progress, and get accountability from like-minded goal achievers."
    },
    {
      icon: Clock,
      title: "Productivity Tools",
      description: "Integrated to-do lists, reminders, notes, and focus tools all in one place."
    },
    {
      icon: Gift,
      title: "Reward System",
      description: "Earn bonuses, unlock achievements, and get your commitment money back with interest."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                GoalMate
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-purple-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-purple-600 transition-colors">How It Works</a>
              <a href="#pricing" className="text-gray-700 hover:text-purple-600 transition-colors">Pricing</a>
              <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                Sign In
              </Button>
              <Button 
                onClick={() => setShowGoalModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Start Your Journey
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection onStartJourney={() => setShowGoalModal(true)} />

      {/* Stats Section */}
      <StatsSection />

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-800">Features</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Achieve Your Goals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform combines cutting-edge technology with proven behavioral psychology 
              to help you commit to and achieve your most important goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-800">Process</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How GoalMate Works
            </h2>
            <p className="text-xl text-gray-600">
              A simple 4-step process to turn your dreams into reality
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Set Your Goal",
                description: "Tell our AI what you want to achieve. Be specific and ambitious."
              },
              {
                step: "2", 
                title: "Get AI Breakdown",
                description: "Our AI creates a personalized roadmap with actionable steps."
              },
              {
                step: "3",
                title: "Make Commitment",
                description: "Put money on the line. Choose your timeline and commitment level."
              },
              {
                step: "4",
                title: "Achieve & Earn",
                description: "Complete tasks, track progress, and get rewarded for success."
              }
            ].map((item, index) => (
              <Card key={index} className="relative overflow-hidden border-purple-100 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                    {item.step}
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialSection />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Life?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of people who are already achieving their goals with GoalMate.
            Your future self will thank you.
          </p>
          <Button 
            size="lg"
            onClick={() => setShowGoalModal(true)}
            className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-3"
          >
            Start Your First Goal
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Target className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold">GoalMate</span>
              </div>
              <p className="text-gray-400">
                AI-powered goal achievement platform that helps you commit to and achieve your dreams.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 GoalMate. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Goal Creation Modal */}
      <GoalCreationModal 
        open={showGoalModal} 
        onOpenChange={setShowGoalModal}
      />
    </div>
  );
};

export default Index;
