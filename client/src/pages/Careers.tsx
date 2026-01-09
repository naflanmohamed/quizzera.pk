import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";

const Careers = () => {
    const openings = [
        {
            role: "Senior Full Stack Dev",
            department: "Engineering",
            location: "Lahore / Remote",
            type: "Full-time"
        },
        {
            role: "Content Strategist",
            department: "Marketing",
            location: "Remote",
            type: "Contract"
        },
        {
            role: "Subject Matter Expert (Physics)",
            department: "Content",
            location: "Lahore",
            type: "Full-time"
        },
         {
            role: "UI/UX Designer",
            department: "Product Design",
            location: "Remote",
            type: "Full-time"
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
              Join our mission
            </motion.h1>
            <p className="text-lg text-muted-foreground mb-8">
              We're building the future of education. Come help us make a difference in the lives of millions of students.
            </p>
             <Button size="lg" className="rounded-full">View Open Roles</Button>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold mb-8">Current Openings</h2>
            {openings.map((job, index) => (
                <motion.div 
                    key={job.role}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 rounded-xl bg-card border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-primary/50 transition-colors cursor-pointer group"
                >
                    <div>
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{job.role}</h3>
                        <p className="text-muted-foreground text-sm mb-3">{job.department}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {job.location}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {job.type}</span>
                        </div>
                    </div>
                    <Button variant="outline">Apply Now</Button>
                </motion.div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;
