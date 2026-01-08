import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, MessageCircle, Send, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api, { Mentor } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const DashboardMentors = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  // const [messages, setMessages] = useState<any[]>([]); // Removed as we use bookings now
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [messageText, setMessageText] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.getMentors(), api.getMyBookings()])
      .then(([mResponse]) => { 
        setMentors(mResponse.mentors); 
        // setBookings(bResponse); // IF we want to show bookings later
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSendMessage = async () => {
    if (!selectedMentor) return;
    try {
        await api.createBooking({
            mentorId: selectedMentor._id,
            date: new Date().toISOString(), // This should be from a date picker
            duration: 60,
            topic: messageText,
            notes: "Initial booking request"
        });
        toast({ title: "Booking requested with " + (selectedMentor.user as any).name });
        setMessageText("");
        setSelectedMentor(null);
    } catch (error: any) {
        toast({ variant: "destructive", title: "Failed to book", description: error.message });
    }
  };

  if (isLoading) return <div className="grid md:grid-cols-2 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-48" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-foreground">My Mentors</h2>
           <p className="text-muted-foreground">Get guidance from expert mentors</p>
        </div>
        <Button onClick={() => navigate("/dashboard/become-mentor")} variant="outline">
           Become a Mentor
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mentors.map((mentor) => (
          <Card key={mentor._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-14 h-14 border-2 border-primary/20">
                  <AvatarImage src={(mentor.user as any)?.avatar} />
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">{(mentor.user as any)?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">{(mentor.user as any)?.name}</h3>
                  <p className="text-sm text-muted-foreground">{mentor.experience}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-3">
                <Star className="w-4 h-4 text-warning fill-warning" />
                <span className="text-sm font-medium">{mentor.rating}</span>
                <span className="text-sm text-muted-foreground">• {mentor.totalSessions} sessions</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {mentor.expertise.slice(0, 3).map((e) => <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>)}
              </div>
              <Button variant="gradient" className="w-full" onClick={() => setSelectedMentor(mentor)}>
                <MessageCircle className="w-4 h-4 mr-2" />Book Session
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>



      <Dialog open={!!selectedMentor} onOpenChange={() => setSelectedMentor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Book Session with {(selectedMentor?.user as any)?.name}</DialogTitle></DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Topic / Message</label>
            <Textarea placeholder="What would you like to discuss?" value={messageText} onChange={(e) => setMessageText(e.target.value)} rows={4} />
          </div>
          <Button variant="gradient" onClick={handleSendMessage} disabled={!messageText.trim()}>
            <Send className="w-4 h-4 mr-2" />Request Booking
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardMentors;
