import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, MessageCircle, Send } from "lucide-react";
import { api, Mentor, MentorMessage } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const DashboardMentors = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [messageText, setMessageText] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([api.getMentors(), api.getMentorMessages()])
      .then(([m, msgs]) => { setMentors(m); setMessages(msgs); })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSendMessage = async () => {
    if (!selectedMentor || !messageText.trim()) return;
    const newMsg = await api.sendMentorMessage(selectedMentor.id, messageText);
    setMessages([newMsg, ...messages]);
    toast({ title: "Message sent to " + selectedMentor.name });
    setMessageText("");
    setSelectedMentor(null);
  };

  if (isLoading) return <div className="grid md:grid-cols-2 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-48" />)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Mentors</h2>
        <p className="text-muted-foreground">Get guidance from expert mentors</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mentors.map((mentor) => (
          <Card key={mentor._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                  {mentor.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{mentor.name}</h3>
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
                <MessageCircle className="w-4 h-4 mr-2" />Ask Question
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {messages.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Recent Conversations</h3>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="p-4 rounded-xl bg-muted/50">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-foreground">{msg.mentorName}</span>
                    <Badge variant={msg.status === "answered" ? "secondary" : "outline"}>{msg.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{msg.message}</p>
                  {msg.response && <p className="text-sm text-foreground mt-2 pl-4 border-l-2 border-primary">{msg.response}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedMentor} onOpenChange={() => setSelectedMentor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ask {selectedMentor?.name}</DialogTitle></DialogHeader>
          <Textarea placeholder="Type your question..." value={messageText} onChange={(e) => setMessageText(e.target.value)} rows={4} />
          <Button variant="gradient" onClick={handleSendMessage} disabled={!messageText.trim()}>
            <Send className="w-4 h-4 mr-2" />Send Message
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardMentors;
