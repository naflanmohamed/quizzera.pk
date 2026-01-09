import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Search, Book, User, CreditCard, ShieldQuestion } from "lucide-react";
import { motion } from "framer-motion";

const HelpCenter = () => {
    const categories = [
        { icon: User, name: "Account & Profile", count: 12 },
        { icon: Book, name: "Courses & Exams", count: 25 },
        { icon: CreditCard, name: "Billing & Subscription", count: 8 },
        { icon: ShieldQuestion, name: "Safety & Privacy", count: 5 },
    ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <section className="container mx-auto px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-8">
              How can we help?
            </h1>
            <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input 
                    type="search" 
                    placeholder="Search for articles, guides..." 
                    className="pl-10 h-12 text-lg rounded-full shadow-sm"
                />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {categories.map((cat, index) => (
                <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer text-center group"
                >
                    <div className="mx-auto h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <cat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground">{cat.count} articles</p>
                </motion.div>
            ))}
          </div>

            <div className="mt-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
                <p className="text-muted-foreground mb-6">Our support team is just a click away.</p>
                <a href="/contact" className="text-primary font-semibold hover:underline">Contact Support &rarr;</a>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;
