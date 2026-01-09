import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-8">
            Refund Policy
          </h1>
          <div className="prose prose-blue dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              Last updated: January 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Satisfaction Guarantee</h2>
              <p className="text-muted-foreground mb-4">
                At Quizzera, we want you to be completely satisfied with our services. We offer a 7-day money-back guarantee on all our premium subscription plans for first-time subscribers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Eligibility for Refunds</h2>
              <p className="text-muted-foreground mb-4">
                To be eligible for a refund, you must meet the following criteria:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>You are within 7 days of your initial purchase date.</li>
                <li>You have not completed more than 20% of the course or exam content.</li>
                <li>You have not downloaded significant portions of the offline content.</li>
                <li>This is your first request for a refund on our platform.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Non-refundable Items</h2>
              <p className="text-muted-foreground mb-4">
                The following items are not eligible for refunds:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Renewal payments (recurring subscriptions) - you must cancel before the renewal date.</li>
                <li>One-time consultation sessions that have already been scheduled or completed.</li>
                <li>Downloadable resources that have already been accessed.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. How to Request a Refund</h2>
              <p className="text-muted-foreground mb-4">
                To request a refund, please contact our support team at payments@quizzera.pk with your transaction details and the reason for your request. We will review your request and process it within 5-7 business days if approved.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about our Refund Policy, please contact us:
                <br /><br />
                By email: payments@quizzera.pk
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
