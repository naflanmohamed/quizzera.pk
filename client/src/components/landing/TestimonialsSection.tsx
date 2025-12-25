import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Ahmed Hassan",
    role: "MDCAT Qualifier",
    image: null,
    content: "Quizzera was a game-changer for my MDCAT preparation. The topic-wise practice and analytics helped me identify my weak areas. I scored 189/200!",
    rating: 5,
    exam: "MDCAT 2024",
  },
  {
    name: "Fatima Khan",
    role: "CSS Aspirant",
    image: null,
    content: "The mock tests are exactly like real exams. The timed practice sessions built my confidence and time management skills. Highly recommended!",
    rating: 5,
    exam: "CSS Written",
  },
  {
    name: "Muhammad Ali",
    role: "Software Engineer",
    image: null,
    content: "Passed my AWS certification on the first attempt thanks to Quizzera. The practice questions covered all the topics I needed.",
    rating: 5,
    exam: "AWS Solutions Architect",
  },
  {
    name: "Sara Malik",
    role: "Banking Professional",
    image: null,
    content: "Got selected for SBP through Quizzera's comprehensive banking exam preparation. The question bank is excellent!",
    rating: 5,
    exam: "SBP OG-II",
  },
  {
    name: "Usman Tariq",
    role: "University Student",
    image: null,
    content: "The ECAT preparation material is top-notch. I improved my physics score from 60% to 95% in just 2 months!",
    rating: 5,
    exam: "ECAT 2024",
  },
  {
    name: "Ayesha Rashid",
    role: "Government Employee",
    image: null,
    content: "Cleared PPSC exam thanks to the comprehensive practice tests. The instant results and explanations saved me so much time.",
    rating: 5,
    exam: "PPSC Lecturer",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="category" className="mb-4">
            Success Stories
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            What Our Students Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of successful students who achieved their goals with Quizzera.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.name}
              variant="elevated" 
              className="relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-primary/20 absolute top-6 right-6" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>

                {/* Exam Badge */}
                <Badge variant="secondary" className="mt-4">
                  {testimonial.exam}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
