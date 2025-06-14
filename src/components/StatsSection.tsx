
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Target, Award } from "lucide-react";

export const StatsSection = () => {
  const stats = [
    {
      icon: Users,
      value: "10,000+",
      label: "Active Goal Achievers",
      color: "text-purple-600"
    },
    {
      icon: Target,
      value: "25,000+",
      label: "Goals Completed",
      color: "text-blue-600"
    },
    {
      icon: TrendingUp,
      value: "89%",
      label: "Success Rate",
      color: "text-green-600"
    },
    {
      icon: Award,
      value: "$2.1M+",
      label: "Rewards Earned",
      color: "text-orange-600"
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-none bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
