import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const formSchema = z.object({
  experience: z.string().min(10, {
    message: "Experience description must be at least 10 characters.",
  }),
  bio: z.string().min(50, {
    message: "Bio must be at least 50 characters to give students a good Idea about you.",
  }),
  expertise: z.string().min(2, {
    message: "Please enter your areas of expertise.",
  }),
  hourlyRate: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Hourly rate must be a positive number.",
  }),
  linkedin: z.string().url({ message: "Please enter a valid LinkedIn URL" }).optional().or(z.literal("")),
  portfolio: z.string().url({ message: "Please enter a valid Portfolio URL" }).optional().or(z.literal("")),
  availability: z.string().min(5, {
    message: "Please describe your availability.",
  }),
});

export default function BecomeMentor() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      experience: "",
      bio: "",
      expertise: "",
      hourlyRate: "",
      linkedin: "",
      portfolio: "",
      availability: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const expertiseArray = values.expertise.split(',').map(item => item.trim()).filter(Boolean);
      
      await api.applyMentor({
        ...values,
        expertise: expertiseArray,
        hourlyRate: Number(values.hourlyRate)
      });

      setIsSubmitted(true);
      toast({
        title: "Application Submitted",
        description: "Your application to become a mentor has been submitted for review.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Something went wrong. Please try again.",
      });
    }
  }

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto mt-8 text-center p-8">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>
        <CardTitle className="text-2xl mb-2">Application Received</CardTitle>
        <CardDescription className="text-lg">
          Thank you for applying to become a mentor! We will review your profile and get back to you shortly.
        </CardDescription>
        <div className="mt-8">
          <Button onClick={() => navigate("/dashboard")} variant="outline">
            Return to Dashboard
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Become a Mentor</h1>
        <p className="text-muted-foreground mt-2">
          Share your knowledge and help others succeed. Fill out the application below.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mentor Profile</CardTitle>
          <CardDescription>
            This information will be used to review your application and will be visible to students once approved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell students about yourself, your background, and your teaching style..." 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      This will be displayed on your mentor profile.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="expertise"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expertise (Comma separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="React, Node.js, System Design, Career Advice" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Experience</FormLabel>
                    <FormControl>
                      <Textarea 
                         placeholder="Describe your work experience and qualifications..."
                         {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Profile URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://linkedin.com/in/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="portfolio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portfolio/Website URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="availability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Weekdays 6pm-9pm EST, Weekends 10am-2pm EST" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
