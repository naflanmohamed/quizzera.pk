import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MessageCircle, Calendar, Star, GraduationCap, ArrowRight, Sparkles, User, CheckCircle2, X, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { Mentor, User as UserType } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const Mentors = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Mentors");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Booking State
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingDuration, setBookingDuration] = useState("60");
  const [bookingTopic, setBookingTopic] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  // Messaging State
  const [messageMentor, setMessageMentor] = useState<Mentor | null>(null);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [isMessageSubmitting, setIsMessageSubmitting] = useState(false);

  // Extract unique categories from mentors
  const categories = ["All Mentors", ...Array.from(new Set(mentors.flatMap(m => m.expertise)))];

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await api.getMentors();
        setMentors(response.mentors);
      } catch {
        toast({
          variant: "destructive",
          title: "Failed to load mentors",
          description: "Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentors();
  }, [toast]);

  const filteredMentors = mentors.filter((mentor) => {
    const mentorUser = mentor.user as UserType;
    const matchesSearch =
      mentorUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise.some(e => e.toLowerCase().includes(searchQuery.toLowerCase())) ||
      mentor.experience?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Simple category filter - check if any expertise matches the category
    const matchesCategory = selectedCategory === "All Mentors" || mentor.expertise.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  const handleBookSession = async () => {
    if (!bookingMentor) return;
    setIsBookingSubmitting(true);
    try {
        await api.createBooking({
            mentorId: bookingMentor._id, // Pass mentor ID, backend sorts out user linkage
            date: bookingDate,
            duration: parseInt(bookingDuration),
            topic: bookingTopic,
            notes: bookingNotes
        });
        toast({
            title: "Booking Requested",
            description: "Your session request has been sent to the mentor."
        });
        setBookingMentor(null);
        setBookingDate("");
        setBookingTopic("");
        setBookingNotes("");
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Booking Failed",
            description: error?.message || "Could not create booking."
        });
    } finally {
        setIsBookingSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageMentor) return;
    setIsMessageSubmitting(true);
    try {
        // We need the User ID of the mentor to send a message
        const mentorUser = messageMentor.user as UserType;
        await api.sendMentorMessage(mentorUser._id, messageSubject, messageContent);
        
        toast({
            title: "Message Sent",
            description: "Your message has been sent successfully."
        });
        setMessageMentor(null);
        setMessageSubject("");
        setMessageContent("");
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Message Failed",
            description: error?.message || "Could not send message."
        });
    } finally {
        setIsMessageSubmitting(false);
    }
  };
  
  const getMentorName = (mentor: Mentor) => {
      return (mentor.user as UserType)?.name || "Mentor";
  };
  
  const getMentorAvatar = (mentor: Mentor) => {
      return (mentor.user as UserType)?.avatar;
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <Navbar />
      
      <main className="pb-24">
        {/* Premium Hero Section */}
        <section className="relative pt-32 pb-40 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-background">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] animate-pulse-slow" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] animate-float" />
          </div>
          
          <div className="container relative mx-auto px-4 z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-primary font-medium text-sm mb-4 bg-white/50 dark:bg-black/20">
                <GraduationCap className="w-4 h-4" />
                <span>Expert Guidance</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
                 Connect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-accent">Experts</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Get personalized guidance from experienced educators. Ask questions,
                request study plans, and book free consultation sessions.
              </p>

              {/* Stats Preview */}
              <div className="flex justify-center gap-8 pt-4">
                 <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-foreground">50+</span>
                    <span className="text-sm text-muted-foreground">Expert Mentors</span>
                </div>
                <div className="w-px h-12 bg-border/50" />
                <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-foreground">1k+</span>
                    <span className="text-sm text-muted-foreground">Sessions</span>
                </div>
                 <div className="w-px h-12 bg-border/50" />
                <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold text-foreground">4.9</span>
                    <span className="text-sm text-muted-foreground">Average Rating</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Content Section */}
        <div className="container mx-auto px-4 -mt-20 relative z-20">
          {/* Glass Search Bar */}
          <div className="max-w-4xl mx-auto mb-16 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="p-2 rounded-2xl glass border border-white/20 shadow-glow flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search mentors by name, expertise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-transparent border-transparent focus-visible:ring-0 text-base placeholder:text-muted-foreground/70"
                />
              </div>
            </div>
            
            {/* Filter */}
            <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto items-center justify-between mt-6">
                <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                     {/* Category Filter */}
                     <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full md:w-[200px] h-11 bg-background/60 backdrop-blur-xl border-primary/20 hover:border-primary/50 transition-all focus:ring-primary/20">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                     </Select>
                </div>

                 {/* Clear Filters */}
                 {(selectedCategory !== "All Mentors" || searchQuery) && (
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setSelectedCategory("All Mentors");
                      setSearchQuery("");
                    }}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    Clear Filters
                    <X className="w-4 h-4 ml-2" />
                  </Button>
               )}
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6 text-primary" />
              Available Mentors
            </h2>
            <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium">
              Showing {filteredMentors.length} mentors
            </Badge>
          </div>

          {/* Mentors Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
               Array.from({ length: 6 }).map((_, i) => (
                   <Card key={i} className="h-[350px] animate-pulse bg-muted/20 border-0">
                       <CardContent className="p-6 h-full flex flex-col">
                           <div className="flex gap-4 mb-4">
                               <Skeleton className="w-16 h-16 rounded-full" />
                               <div className="flex-1 space-y-2">
                                   <Skeleton className="h-4 w-3/4" />
                                   <Skeleton className="h-4 w-1/2" />
                               </div>
                           </div>
                           <Skeleton className="h-20 w-full mb-4" />
                           <Skeleton className="h-10 w-full mt-auto" />
                       </CardContent>
                   </Card>
               ))
            ) : filteredMentors.length === 0 ? (
                <div className="col-span-full py-20 text-center glass rounded-3xl border border-dashed border-primary/20">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                     <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">No mentors found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search criteria.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All Mentors");
                    }}
                    className="hover:bg-primary/5 border-primary/20 hover:border-primary/50"
                  >
                    Clear filters
                  </Button>
                </div>
            ) : (
                filteredMentors.map((mentor) => (
                  <Card
                    key={mentor._id}
                    className="group h-full border border-border/50 bg-card/50 hover:bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-card hover:-translate-y-1 overflow-hidden relative flex flex-col"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <CardContent className="p-6 relative flex flex-col flex-1">
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4">
                         <div className="relative">
                            <Avatar className="w-16 h-16 border-2 border-primary/20 shadow-md group-hover:border-primary/50 transition-colors">
                              <AvatarImage src={getMentorAvatar(mentor)} />
                              <AvatarFallback className="text-xl bg-primary/10 text-primary">{getMentorName(mentor).charAt(0)}</AvatarFallback>
                            </Avatar>
                            {mentor.isAvailable && (
                                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background animate-pulse" title="Available now" />
                            )}
                         </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {getMentorName(mentor)}
                          </h3>
                          <p className="text-sm text-primary font-medium line-clamp-1 mb-1">
                            {mentor.expertise[0]}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                {mentor.rating || "New"}
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageCircle className="w-3.5 h-3.5" />
                                {mentor.totalSessions} sessions
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed flex-1">
                        {mentor.bio}
                      </p>

                      {/* Expertise Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {mentor.expertise.slice(0, 3).map((subject) => (
                          <Badge key={subject} variant="secondary" className="text-xs bg-secondary/50 hover:bg-secondary">
                            {subject}
                          </Badge>
                        ))}
                        {mentor.expertise.length > 3 && (
                          <Badge variant="outline" className="text-xs border-dashed">+{mentor.expertise.length - 3}</Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 mt-auto pt-4 border-t border-border/50">
                        <Button 
                            variant="ghost" 
                            className="flex-1 hover:bg-primary/10 hover:text-primary" 
                            size="sm" 
                            onClick={() => setMessageMentor(mentor)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                        <Button
                          variant={mentor.isAvailable ? "default" : "secondary"}
                          className={`flex-1 ${mentor.isAvailable ? 'shadow-lg shadow-primary/20' : ''}`}
                          size="sm"
                          disabled={!mentor.isAvailable}
                          onClick={() => setBookingMentor(mentor)}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          {mentor.isAvailable ? "Book" : "Busy"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
          
           {/* Become a Mentor Section */}
           <div className="mt-24 relative overflow-hidden rounded-3xl">
             <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark" />
             <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px]" />
             
             <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center p-8 sm:p-12">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white font-medium text-xs mb-4 backdrop-blur-sm border border-white/20">
                     <Sparkles className="w-3 h-3" />
                     <span>Join the Team</span>
                  </div>
                   <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Share Your Knowledge,<br/>Inspire Future Leaders</h2>
                   <p className="text-white/80 text-lg mb-8 max-w-xl leading-relaxed">
                      Join our community of expert mentors. Earn money teaching what you love, set your own schedule, and make a real difference.
                   </p>
                   <Button size="lg" variant="secondary" className="font-bold shadow-xl" onClick={() => navigate("/dashboard/become-mentor")}>
                      Apply to Become a Mentor
                      <ArrowRight className="w-5 h-5 ml-2" />
                   </Button>
                </div>
                
                <div className="hidden lg:grid grid-cols-2 gap-4 opacity-80">
                   <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                       <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                       <h3 className="font-bold text-white mb-1">Flexible Schedule</h3>
                       <p className="text-xs text-white/70">Work whenever fits you</p>
                   </div>
                   <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 translate-y-8">
                       <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                       <h3 className="font-bold text-white mb-1">Earn Money</h3>
                       <p className="text-xs text-white/70">Get paid for your expertise</p>
                   </div>
                   <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                       <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                       <h3 className="font-bold text-white mb-1">Global Reach</h3>
                       <p className="text-xs text-white/70">Connect with students worldwide</p>
                   </div>
                   <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 translate-y-8">
                       <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                       <h3 className="font-bold text-white mb-1">Community</h3>
                       <p className="text-xs text-white/70">Join elite educators</p>
                   </div>
                </div>
             </div>
           </div>
        </div>
      </main>

      {/* Booking Dialog */}
      <Dialog open={!!bookingMentor} onOpenChange={(open) => !open && setBookingMentor(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Book a Session</DialogTitle>
                <DialogDescription>
                    Schedule a mentorship session with {(bookingMentor?.user as any)?.name}.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Input id="topic" placeholder="e.g., Code Review, Career Advice" value={bookingTopic} onChange={(e) => setBookingTopic(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="date">Date & Time</Label>
                        <Input id="date" type="datetime-local" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="duration">Duration</Label>
                        <Select value={bookingDuration} onValueChange={setBookingDuration}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="60">60 minutes</SelectItem>
                                <SelectItem value="90">90 minutes</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea id="notes" placeholder="Any specific questions or context..." value={bookingNotes} onChange={(e) => setBookingNotes(e.target.value)} />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setBookingMentor(null)}>Cancel</Button>
                <Button onClick={handleBookSession} disabled={isBookingSubmitting}>
                    {isBookingSubmitting && <Clock className="w-4 h-4 mr-2 animate-spin" />}
                    Confirm Booking
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={!!messageMentor} onOpenChange={(open) => !open && setMessageMentor(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Send Message</DialogTitle>
                <DialogDescription>
                    Send a direct message to {(messageMentor?.user as any)?.name}.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="What is this regarding?" value={messageSubject} onChange={(e) => setMessageSubject(e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="content">Message</Label>
                    <Textarea 
                        id="content" 
                        placeholder="Type your message here..." 
                        rows={5}
                        value={messageContent} 
                        onChange={(e) => setMessageContent(e.target.value)} 
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setMessageMentor(null)}>Cancel</Button>
                <Button onClick={handleSendMessage} disabled={isMessageSubmitting}>
                    {isMessageSubmitting && <Clock className="w-4 h-4 mr-2 animate-spin" />}
                    Send Message
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default Mentors;
