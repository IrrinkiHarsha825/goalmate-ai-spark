
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Target, Zap } from "lucide-react";

interface HeroSectionProps {
  onStartJourney: () => void;
}

export const HeroSection = ({ onStartJourney }: HeroSectionProps) => {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-indigo-600/10"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center">
          <Badge className="mb-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Goal Achievement
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Turn Your Dreams Into
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Reality</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            GoalMate combines AI guidance, smart commitment systems, and proven psychology 
            to help you achieve your most ambitious goals. Put money on the line, get personalized coaching, 
            and watch your dreams become reality.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg"
              onClick={onStartJourney}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50 text-lg px-8 py-3"
            >
              Watch Demo
              <Zap className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Target,
                title: "Smart Goal Breakdown",
                description: "AI creates personalized roadmaps"
              },
              {
                icon: Zap,
                title: "Commitment System",
                description: "Put money on the line for results"
              },
              {
                icon: Sparkles,
                title: "Reward & Achieve",
                description: "Get paid to reach your goals"
              }
            ].map((item, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 hover:shadow-lg transition-shadow">
                <item.icon className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
