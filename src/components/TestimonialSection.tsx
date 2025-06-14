
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";

export const TestimonialSection = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      content: "GoalMate helped me learn full-stack development in 6 months. The commitment system kept me accountable, and I got all my money back plus bonuses!",
      rating: 5,
      achievement: "Completed Full-Stack Course"
    },
    {
      name: "Marcus Rodriguez",
      role: "Entrepreneur", 
      content: "I've tried so many productivity apps, but GoalMate is different. Putting money on the line changed everything. Finally launched my startup!",
      rating: 5,
      achievement: "Launched Startup"
    },
    {
      name: "Emma Thompson",
      role: "Fitness Enthusiast",
      content: "Lost 30 pounds in 4 months with GoalMate's AI coaching and accountability system. The community support was incredible too.",
      rating: 5,
      achievement: "30 lbs Weight Loss"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-green-100 text-green-800">Success Stories</Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Real People, Real Results
          </h2>
          <p className="text-xl text-gray-600">
            See how GoalMate is transforming lives and helping people achieve their dreams
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative bg-white/80 backdrop-blur-sm border-purple-100 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <Quote className="h-8 w-8 text-purple-400 mb-4" />
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    {testimonial.achievement}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
