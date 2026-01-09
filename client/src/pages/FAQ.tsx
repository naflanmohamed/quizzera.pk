import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <section className="container mx-auto px-6 lg:px-8 max-w-3xl">
          <div className="text-center mb-16">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about Quizzera.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is Quizzera?</AccordionTrigger>
              <AccordionContent>
                Quizzera is a comprehensive exam preparation platform that helps students prepare for competitive exams through adaptive quizzes, mock tests, and expert mentorship.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is Quizzera free to use?</AccordionTrigger>
              <AccordionContent>
                We offer a Basic plan which is free forever and gives you access to daily quizzes. For advanced features like unlimited exams, analytics, and offline access, you can upgrade to our Pro plan.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Can I access it on mobile?</AccordionTrigger>
              <AccordionContent>
                Yes! Quizzera is fully responsive and works on all devices. We also have dedicated mobile apps coming soon for both iOS and Android.
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-4">
              <AccordionTrigger>How do I contact a mentor?</AccordionTrigger>
              <AccordionContent>
                Once you sign up, you can browse our list of qualified mentors in the "Mentors" section. You can book sessions or chat with them directly through the platform.
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-5">
              <AccordionTrigger>What happens if I fail a quiz?</AccordionTrigger>
              <AccordionContent>
                Don't worry! Quizzera is designed to help you learn. You can retake quizzes, review detailed explanations for answers, and track your improvement over time.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
