import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";

const Feedback = () => {
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success("Thank you for your feedback!");
        setLoading(false);
        (e.target as HTMLFormElement).reset();
    };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-2xl">
            <div className="text-center mb-10">
                <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <MessageSquarePlus className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
                    We value your feedback
                </h1>
                <p className="text-muted-foreground">
                    Help us improve Quizzera. Let us know about your experience, report a bug, or suggest a new feature.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-card p-8 rounded-2xl border border-border shadow-sm">
                <div className="space-y-4">
                    <Label className="text-base">What type of feedback is this?</Label>
                    <RadioGroup defaultValue="suggestion" className="grid grid-cols-3 gap-4">
                        <div>
                            <RadioGroupItem value="bug" id="bug" className="peer sr-only" />
                            <Label
                                htmlFor="bug"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                                Bug Report
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="suggestion" id="suggestion" className="peer sr-only" />
                            <Label
                                htmlFor="suggestion"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                                Suggestion
                            </Label>
                        </div>
                         <div>
                            <RadioGroupItem value="other" id="other" className="peer sr-only" />
                            <Label
                                htmlFor="other"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                                Other
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                    <p className="text-xs text-muted-foreground">If you'd like us to follow up with you.</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="message">Your comments</Label>
                    <Textarea 
                        id="message" 
                        placeholder="Please describe your feedback in detail..." 
                        className="min-h-[150px]"
                        required 
                    />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Feedback"}
                </Button>
            </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Feedback;
