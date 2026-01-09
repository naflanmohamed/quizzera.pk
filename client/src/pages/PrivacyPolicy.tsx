import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-8">
            Privacy Policy
          </h1>
          <div className="prose prose-blue dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              Last updated: January 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
              <p className="text-muted-foreground mb-4">
                Welcome to Quizzera ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at privacy@quizzera.pk.
              </p>
              <p className="text-muted-foreground">
                When you visit our website and use our services, you trust us with your personal information. We take your privacy very seriously. In this privacy policy, we seek to explain to you in the clearest way possible what information we collect, how we use it, and what rights you have in relation to it.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
              <p className="text-muted-foreground mb-4">
                We collect personal information that you voluntarily provide to us when registering at the Services expressing an interest in obtaining information about us or our products and services, when participating in activities on the Services or otherwise contacting us.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Name and Contact Data. We collect your first and last name, email address, postal address, phone number, and other similar contact data.</li>
                <li>Credentials. We collect passwords, password hints, and similar security information used for authentication and account access.</li>
                <li>Payment Data. We collect data necessary to process your payment if you make purchases, such as your payment instrument number (such as a credit card number), and the security code associated with your payment instrument.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">
                We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>To facilitate account creation and logon process.</li>
                <li>To send administrative information to you.</li>
                <li>To fulfill and manage your orders.</li>
                <li>To post testimonials.</li>
                <li>To deliver targeted advertising to you.</li>
              </ul>
            </section>

             <section className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions or comments about this policy, you may email us at privacy@quizzera.pk or by post to:
                <br /><br />
                Mentisera<br />
                 Street 11, Ghuari Town, 5-B Islamabad, Pakistan
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
