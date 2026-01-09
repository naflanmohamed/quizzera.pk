import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BookOpen, Brain, Trophy, BarChart, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";

const Features = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Comprehensive Exam Library",
      description: "Access thousands of practice questions across various competitive exams and subjects."
    },
    {
      icon: Brain,
      title: "Smart Adaptive Learning",
      description: "Our AI-powered system adapts to your performance, focusing on your weak areas."
    },
    {
      icon: Trophy,
      title: "Gamified Experience",
      description: "Earn badges, climb leaderboards, and stay motivated throughout your preparation journey."
    },
    {
      icon: BarChart,
      title: "Detailed Analytics",
      description: "Track your progress with in-depth performance analysis and improvement insights."
    },
    {
      icon: Users,
      title: "Expert Mentorship",
      description: "Connect with qualified mentors for guidance, doubts clearing, and career advice."
    },
    {
      icon: Zap,
      title: "Real-time Mock Tests",
      description: "Experience the actual exam environment with our timed mock tests and simulations."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <section className="container mx-auto px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-6"
            >
              Everything you need to <span className="text-primary">excel</span>
            </motion.h1>
            <p className="text-lg text-muted-foreground">
              Built with cutting-edge technology to help you learn smarter, not harder.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Features;
