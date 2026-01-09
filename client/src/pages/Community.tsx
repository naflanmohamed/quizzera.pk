import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Heart } from "lucide-react";
import { motion } from "framer-motion";

const Community = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <section className="container mx-auto px-6 lg:px-8 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto py-16"
            >
                <div className="mx-auto h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
                    <Users className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
                    Join the Conversation
                </h1>
                <p className="text-lg text-muted-foreground mb-10">
                    Connect with fellow students, share study tips, and get motivation from the Quizzera community. Our forums are a safe space for learning and growth.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button size="lg" className="gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Visit Forums
                    </Button>
                    <Button size="lg" variant="outline" className="gap-2">
                        <Heart className="w-4 h-4" />
                        Community Guidelines
                    </Button>
                </div>
            </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Community;
