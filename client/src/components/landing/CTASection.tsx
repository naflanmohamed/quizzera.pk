import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const benefits = [
  "Access to 500+ mock tests",
  "Detailed performance analytics",
  "AI-powered recommendations",
  "Expert-curated question banks",
];

export function CTASection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl gradient-hero overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary-foreground rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-foreground rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative px-8 py-16 sm:px-16 sm:py-20 lg:px-24 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary-foreground mb-6 leading-tight">
                  Start Your Success Journey Today
                </h2>
                <p className="text-lg text-primary-foreground/80 mb-8">
                  Join 50,000+ students who are already preparing smarter. Get unlimited access to all exams, quizzes, and mentor guidance — completely free.
                </p>
                
                <ul className="space-y-3 mb-8">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3 text-primary-foreground">
                      <CheckCircle2 className="w-5 h-5 text-accent-light" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="hero-outline" size="xl" asChild>
                    <Link to="/quizzes">
                      Start Learning Now
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Visual */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative">
                  {/* Card Stack Effect */}
                  <div className="absolute inset-0 bg-primary-foreground/10 rounded-2xl transform rotate-6 translate-x-4 translate-y-4" />
                  <div className="absolute inset-0 bg-primary-foreground/10 rounded-2xl transform rotate-3 translate-x-2 translate-y-2" />
                  <div className="relative bg-primary-foreground/20 backdrop-blur-sm rounded-2xl p-8 border border-primary-foreground/20">
                    <div className="text-center">
                      <div className="text-6xl font-extrabold text-primary-foreground mb-2">
                        100%
                      </div>
                      <div className="text-xl font-semibold text-primary-foreground/90 mb-4">
                        Free Forever
                      </div>
                      <div className="text-sm text-primary-foreground/70">
                        No hidden charges
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
