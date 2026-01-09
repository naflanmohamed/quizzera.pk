import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Smartphone, Download, Star } from "lucide-react";
import { motion } from "framer-motion";

const MobileApp = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 overflow-hidden">
        <section className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary mb-6">
                <Star className="w-4 h-4 mr-2 fill-primary" />
                #1 Exam Prep App in Pakistan
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-6">
                Learning in your pocket
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Download the Quizzera app for iOS and Android. Practice on the go, even without an internet connection. Sync your progress seamlessly across all devices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button className="h-14 px-8 text-lg gap-3">
                    <Download className="w-5 h-5" />
                    Download for iOS
                </Button>
                 <Button variant="outline" className="h-14 px-8 text-lg gap-3">
                    <Download className="w-5 h-5" />
                    Download for Android
                </Button>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-zinc-200" />
                    ))}
                </div>
                <p>Trusted by 50,000+ students</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative lg:h-[600px] flex items-center justify-center"
            >
                {/* Abstract Phone Mockup */}
                <div className="relative w-[300px] h-[600px] bg-zinc-900 rounded-[3rem] border-8 border-zinc-800 shadow-2xl overflow-hidden">
                    <div className="absolute top-0 w-full h-full bg-zinc-950 flex flex-col items-center justify-center text-white p-8 text-center">
                        <Smartphone className="w-24 h-24 mb-6 text-zinc-700" />
                        <h3 className="text-2xl font-bold mb-2">Quizzera Mobile</h3>
                        <p className="text-zinc-500">Coming soon to App Store and Play Store</p>
                    </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full" />
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MobileApp;
