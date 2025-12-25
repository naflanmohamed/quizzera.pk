import { Users, BookCheck, Trophy, Clock } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "50,000+",
    label: "Active Students",
    description: "Learning and growing together",
  },
  {
    icon: BookCheck,
    value: "25,000+",
    label: "Practice Questions",
    description: "Curated by exam experts",
  },
  {
    icon: Trophy,
    value: "92%",
    label: "Success Rate",
    description: "Students achieving their goals",
  },
  {
    icon: Clock,
    value: "500+",
    label: "Mock Tests",
    description: "Across all categories",
  },
];

export function StatsSection() {
  return (
    <section className="py-20 gradient-hero relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary-foreground rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary-foreground rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="text-center group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <stat.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="text-4xl sm:text-5xl font-extrabold text-primary-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-primary-foreground/90 mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-primary-foreground/70">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
