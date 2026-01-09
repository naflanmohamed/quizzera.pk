import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Users, Target, Shield } from "lucide-react";
import { motion } from "framer-motion";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative px-6 lg:px-8 mb-20">
          <div className="mx-auto max-w-2xl text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600"
            >
              Empowering Students to Achieve Excellence
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg leading-8 text-muted-foreground"
            >
              We're on a mission to democratize quality education and make exam preparation accessible, engaging, and effective for everyone.
            </motion.p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-secondary/30 mb-20">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-y-16 gap-x-8 sm:grid-cols-2 lg:grid-cols-4 text-center">
              {[
                { label: 'Active Students', value: '10,000+' },
                { label: 'Practice Questions', value: '50,000+' },
                { label: 'Expert Mentors', value: '100+' },
                { label: 'Success Rate', value: '95%' },
              ].map((stat, index) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="mx-auto flex max-w-xs flex-col gap-y-4"
                >
                  <dt className="text-base leading-7 text-muted-foreground">{stat.label}</dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                    {stat.value}
                  </dd>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="container mx-auto px-6 lg:px-8 mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                At Quizzera, we believe that every student deserves access to high-quality educational resources. We combine cutting-edge technology with expert-curated content to create a personalized learning experience that adapts to your needs.
              </p>
              <div className="space-y-8">
                {[
                  {
                    icon: Target,
                    title: "Precision Learning",
                    description: "Adaptive algorithms that target your weak areas and maximize your study efficiency."
                  },
                  {
                    icon: Shield,
                    title: "Quality Content",
                    description: "All our questions and materials are vetted by industry experts and top educators."
                  },
                  {
                    icon: Users,
                    title: "Community Driven",
                    description: "Join a vibrant community of learners and mentors supporting each other's growth."
                  }
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex-none">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <item.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-2 text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-blue-600/20 rounded-3xl blur-2xl" />
              <div className="relative rounded-3xl bg-card border border-border p-8 shadow-xl">
                 <div className="aspect-[4/3] rounded-2xl bg-secondary/50 flex items-center justify-center overflow-hidden">
                    {/* Placeholder for an image or graphic */}
                    <img 
                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
                        alt="Team collaboration" 
                        className="object-cover w-full h-full opacity-80 hover:opacity-100 transition-opacity duration-500"
                    />
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Join CTA */}
        <section className="container mx-auto px-6 lg:px-8">
          <div className="relative isolate overflow-hidden bg-primary px-6 py-24 shadow-2xl rounded-3xl sm:px-24 xl:py-32">
            <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to start your journey?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-lg leading-8 text-blue-100">
              Join thousands of students who are already learning smarter with Quizzera.
            </p>
            <div className="mt-10 flex justify-center gap-x-6">
              <a
                href="/register"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
              >
                Get started today
              </a>
              <a href="/contact" className="text-sm font-semibold leading-6 text-white flex items-center gap-2">
                Contact sales <span aria-hidden="true">→</span>
              </a>
            </div>
            <svg
              viewBox="0 0 1024 1024"
              className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
              aria-hidden="true"
            >
              <circle cx={512} cy={512} r={512} fill="url(#gradient)" fillOpacity="0.25" />
              <defs>
                <radialGradient id="gradient">
                  <stop stopColor="white" />
                  <stop offset={1} stopColor="white" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUs;
