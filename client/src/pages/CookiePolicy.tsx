import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const CookiePolicy = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-24 pb-16">
                <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-8">
                        Cookie Policy
                    </h1>
                    <div className="prose prose-blue dark:prose-invert max-w-none">
                        <p className="text-lg text-muted-foreground mb-6">
                            Last updated: January 2025
                        </p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">1. What are cookies?</h2>
                            <p className="text-muted-foreground mb-4">
                                Cookies are small text files that are used to store small pieces of information. They are stored on your device when the website is loaded on your browser. These cookies help us make the website function properly, make it more secure, provide better user experience, and understand how the website performs and to analyze what works and where it needs improvement.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">2. How do we use cookies?</h2>
                            <p className="text-muted-foreground mb-4">
                                As most of the online services, our website uses first-party and third-party cookies for several purposes. First-party cookies are mostly necessary for the website to function the right way, and they do not collect any of your personally identifiable data.
                            </p>
                            <p className="text-muted-foreground">
                                The third-party cookies used on our website are mainly for understanding how the website performs, how you interact with our website, keeping our services secure, providing advertisements that are relevant to you, and all in all providing you with a better and improved user experience and help speed up your future interactions with our website.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Types of Cookies we use</h2>
                             <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li><strong>Essential:</strong> Some cookies are essential for you to be able to experience the full functionality of our site. They allow us to maintain user sessions and prevent any security threats. They do not collect or store any personal information.</li>
                                <li><strong>Statistics:</strong> These cookies store information like the number of visitors to the website, the number of unique visitors, which pages of the website have been visited, the source of the visit, etc. These data help us understand and analyze how well the website performs and where it needs improvement.</li>
                                <li><strong>Functional:</strong> These are the cookies that help certain non-essential functionalities on our website. These functionalities include embedding content like videos or sharing content of the website on social media platforms.</li>
                            </ul>
                        </section>
                        
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Manage your preferences</h2>
                            <p className="text-muted-foreground">
                                You can change your cookie preferences any time by clicking on the settings button on our website. This will let you revisit the cookie consent banner and change your preferences or withdraw your consent right away.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CookiePolicy;
