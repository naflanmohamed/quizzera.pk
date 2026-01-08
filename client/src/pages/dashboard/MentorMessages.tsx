import { useState, useEffect } from "react";
import { api, Message, User } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Mail, Send, Eye, Reply } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MentorMessages() {
  const [inbox, setInbox] = useState<Message[]>([]);
  const [sent, setSent] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replySubject, setReplySubject] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState("inbox");

  useEffect(() => {
    fetchMessages();
  }, [activeTab]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const [inboxData, sentData] = await Promise.all([
        api.getMyMessages(),
        api.getSentMessages()
      ]);
      setInbox(inboxData);
      setSent(sentData);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load messages.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewMessage = async (message: Message) => {
      setSelectedMessage(message);
      if (activeTab === 'inbox' && !message.isRead) {
          try {
              await api.markMessageAsRead(message._id);
              // Update local state to reflect read status
              setInbox(prev => prev.map(m => m._id === message._id ? { ...m, isRead: true } : m));
          } catch (error) {
              console.error("Failed to mark as read", error);
          }
      }
  };

  const handleReply = async () => {
      if (!selectedMessage) return;
      
      const recipient = activeTab === 'inbox' ? selectedMessage.sender : selectedMessage.recipient;
      // If we are looking at sent items, we reply to the recipient (follow up) or it might be weird. 
      // Usually user replies to INBOX messages.
      // If activeTab is 'inbox', sender is the student.
      
      const recipientId = (recipient as User)._id;

      setIsSending(true);
      try {
          await api.sendMentorMessage(recipientId, replySubject, replyContent);
          toast({
              title: "Message Sent",
              description: "Your reply has been sent successfully."
          });
          setIsReplyOpen(false);
          setReplySubject("");
          setReplyContent("");
          fetchMessages(); // Refresh to show in sent?
      } catch {
          toast({
              variant: "destructive",
              title: "Failed to Send",
              description: "Could not send your message."
          });
      } finally {
          setIsSending(false);
      }
  };

  const openReplyDialog = (message: Message) => {
      setReplySubject(`Re: ${message.subject}`);
      setIsReplyOpen(true);
  };

  const getUser = (user: string | User) => {
      if (typeof user === 'object' && user !== null) return user as User;
      return { name: 'Unknown', email: '', avatar: '', _id: user as string } as User;
  };

  const getDialogUser = () => {
      if (!selectedMessage) return { name: 'Unknown', avatar: undefined };
      const user = activeTab === 'inbox' ? selectedMessage.sender : selectedMessage.recipient;
      return getUser(user);
  };

  const dialogUser = getDialogUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground mt-2">
          Communicate with your students and mentees.
        </p>
      </div>

      <Tabs defaultValue="inbox" onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
              <TabsTrigger value="inbox" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Inbox
                  {inbox.filter(m => !m.isRead).length > 0 && (
                      <Badge variant="secondary" className="ml-1 px-1 h-5 min-w-[1.25rem]">{inbox.filter(m => !m.isRead).length}</Badge>
                  )}
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex items-center gap-2">
                  <Send className="w-4 h-4" /> Sent
              </TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Inbox</CardTitle>
                    <CardDescription>Messages from students.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <MessageTable 
                            messages={inbox} 
                            type="inbox" 
                            onView={handleViewMessage} 
                            getUser={getUser} 
                        />
                    )}
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Sent Messages</CardTitle>
                    <CardDescription>History of your sent messages.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <MessageTable 
                            messages={sent} 
                            type="sent" 
                            onView={handleViewMessage} 
                            getUser={getUser} 
                        />
                    )}
                </CardContent>
            </Card>
          </TabsContent>
      </Tabs>

      {/* View Message Dialog */}
      <Dialog open={!!selectedMessage && !isReplyOpen} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="max-w-lg">
            <DialogHeader>
                <DialogTitle>{selectedMessage?.subject}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-2">
                    {activeTab === 'inbox' ? 'From:' : 'To:'} 
                    <Avatar className="w-6 h-6">
                        <AvatarImage src={dialogUser.avatar} />
                        <AvatarFallback>{dialogUser.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">
                        {dialogUser.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                        {selectedMessage && format(new Date(selectedMessage.createdAt), "PP p")}
                    </span>
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 whitespace-pre-wrap text-sm">
                {selectedMessage?.content}
            </div>
            <DialogFooter>
                {activeTab === 'inbox' && (
                    <Button onClick={() => selectedMessage && openReplyDialog(selectedMessage)}>
                        <Reply className="w-4 h-4 mr-2" /> Reply
                    </Button>
                )}
                <Button variant="secondary" onClick={() => setSelectedMessage(null)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={isReplyOpen} onOpenChange={setIsReplyOpen}>
        <DialogContent className="max-w-lg">
            <DialogHeader>
                <DialogTitle>Reply Message</DialogTitle>
                <DialogDescription>
                    Replying to {selectedMessage && getUser(selectedMessage.sender).name}
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input value={replySubject} onChange={e => setReplySubject(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea 
                        value={replyContent} 
                        onChange={e => setReplyContent(e.target.value)} 
                        rows={5}
                        placeholder="Type your message here..."
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsReplyOpen(false)}>Cancel</Button>
                <Button onClick={handleReply} disabled={isSending}>
                    {isSending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Send Reply
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MessageTable({ messages, type, onView, getUser }: { messages: Message[], type: 'inbox' | 'sent', onView: (m: Message) => void, getUser: (u: string | User) => User }) {
    if (messages.length === 0) {
        return <div className="text-center py-8 text-muted-foreground">No messages found.</div>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{type === 'inbox' ? 'Sender' : 'Recipient'}</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {messages.map(msg => {
                    const user = getUser(type === 'inbox' ? msg.sender : msg.recipient);
                    return (
                        <TableRow key={msg._id} className={!msg.isRead && type === 'inbox' ? 'bg-muted/50 font-medium' : ''}>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span>{user.name}</span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{msg.subject}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                                {format(new Date(msg.createdAt), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button size="sm" variant="ghost" onClick={() => onView(msg)}>
                                    <Eye className="w-4 h-4 mr-2" /> Read
                                </Button>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
