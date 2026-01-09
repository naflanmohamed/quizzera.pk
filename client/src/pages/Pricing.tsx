import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Pricing = () => {
  const plans = [
    {
      name: "Basic",
      price: "Free",
      description: "Essential tools for casual learners",
      features: [
        "Access to daily free quizzes",
        "Basic performance tracking",
        "Community forum access",
        "Limited questions per day"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      price: "PKR 1,500/mo",
      description: "Everything you need to ace your exams",
      features: [
        "Unlimited access to all exams",
        "Advanced performance analytics",
        "Priority mentor support",
        "Ad-free experience",
        "Offline downloads"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For institutions and coaching centers",
      features: [
        "Bulk student management",
        "Custom quiz creation",
        "Performance reports API",
        "White-label options",
        "Dedicated account manager"
      ],
      cta: "Contact Sales",
      popular: false
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
              Simple, transparent pricing
            </motion.h1>
            <p className="text-lg text-muted-foreground">
              Choose the plan that best fits your learning needs. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-3xl p-8 ring-1 transition-all ${
                  plan.popular 
                    ? "bg-primary/5 ring-primary shadow-xl scale-105" 
                    : "bg-card ring-border hover:ring-primary/50"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-white">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold leading-8 text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-4 text-3xl font-bold tracking-tight text-foreground">
                  {plan.price}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {plan.description}
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`mt-8 w-full ${!plan.popular ? "variant-outline" : ""}`} 
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
