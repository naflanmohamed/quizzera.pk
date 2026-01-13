import { useState, useEffect } from "react";
import api, { Booking, User } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, CheckCircle2, XCircle, Video, MessageSquare, Calendar as CalendarIcon } from "lucide-react";
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

export default function MentorBookings({ mode = 'all' }: { mode?: 'requests' | 'sessions' | 'all' }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [meetingLink, setMeetingLink] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await api.getMentorBookings();
      setBookings(data);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load bookings.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string, link?: string) => {
    setIsUpdating(true);
    try {
      await api.updateBookingStatus(id, status, link);
      toast({
        title: "Booking Updated",
        description: `Booking has been ${status}.`,
      });
      fetchBookings();
      setSelectedBooking(null);
      setMeetingLink("");
    } catch (error) {
      console.error("Update failed:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update booking status.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStudent = (booking: Booking | null): User | null => {
      if (!booking || !booking.student) return null;
      if (typeof booking.student === 'object') {
          return booking.student as User;
      }
      return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredBookings = bookings.filter(b => {
      if (mode === 'requests') return b.status === 'pending';
      if (mode === 'sessions') return ['confirmed', 'completed', 'cancelled'].includes(b.status);
      return true;
  });

  return (
    <div className="space-y-6">
      {!mode || mode === 'all' && (
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Booking Requests</h1>
        <p className="text-muted-foreground mt-2">
          Manage your upcoming mentorship sessions and requests.
        </p>
      </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {mode === 'requests' ? 'Pending Requests' : mode === 'sessions' ? 'My Sessions' : 'All Bookings'}
          </CardTitle>
          <CardDescription>
            {mode === 'requests' 
                ? `You have ${filteredBookings.length} pending requests.` 
                : `Showing ${filteredBookings.length} sessions.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Topic & Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No {mode === 'requests' ? 'pending requests' : 'bookings'} found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => {
                  const student = getStudent(booking);
                  return (
                    <TableRow key={booking._id}>
                        <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar>
                            <AvatarImage src={student?.avatar} />
                            <AvatarFallback>{student?.name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <div>
                            <div className="font-medium">{student?.name || "Unknown User"}</div>
                            <div className="text-xs text-muted-foreground">{student?.email}</div>
                            </div>
                        </div>
                        </TableCell>
                        <TableCell>
                        <div className="space-y-1">
                            <div className="font-medium flex items-center gap-2">
                            <MessageSquare className="w-3 h-3 text-muted-foreground" />
                            {booking.topic}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <CalendarIcon className="w-3 h-3" />
                            {format(new Date(booking.date), "MMM d, yyyy h:mm a")}
                            <Badge variant="outline" className="ml-2 text-[10px] h-4">
                                {booking.duration} min
                            </Badge>
                            </div>
                            {booking.meetingLink && (
                                <div className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                                    <Video className="w-3 h-3" /> 
                                    <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        Join Meeting
                                    </a>
                                </div>
                            )}
                        </div>
                        </TableCell>
                        <TableCell>
                        <Badge 
                            variant={
                            booking.status === "confirmed" ? "default" : 
                            booking.status === "completed" ? "secondary" :
                            booking.status === "cancelled" ? "destructive" : "outline"
                            }
                            className={booking.status === "confirmed" ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                            {booking.status}
                        </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            {booking.status === 'pending' && (
                            <>
                                <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => setSelectedBooking(booking)}
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Accept
                                </Button>

                                <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleStatusUpdate(booking._id, "cancelled")}
                                disabled={isUpdating}
                                >
                                <XCircle className="w-4 h-4 mr-2" /> Reject
                                </Button>
                            </>
                            )}
                            
                            {booking.status === 'confirmed' && (
                                <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleStatusUpdate(booking._id, "completed")}
                                disabled={isUpdating}
                                >
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Done
                                </Button>
                            )}
                        </div>
                        </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Accept Booking Request</DialogTitle>
                <DialogDescription>
                    Provide a meeting link for the session with {selectedBooking ? getStudent(selectedBooking)?.name : 'Student'}.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="link">Meeting Link (Google Meet / Zoom)</Label>
                    <Input
                        id="link"
                        placeholder="https://meet.google.com/..."
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                    />
                </div>
            </div>
            <DialogFooter>
                <Button 
                    onClick={() => selectedBooking && handleStatusUpdate(selectedBooking._id, "confirmed", meetingLink)}
                    disabled={isUpdating}
                >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Confirm & Send Link"}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </div>
  );
}
