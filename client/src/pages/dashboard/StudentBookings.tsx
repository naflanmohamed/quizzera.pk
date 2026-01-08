import { useState, useEffect } from "react";
import api, { Booking, User } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, XCircle, Video, MessageSquare, Calendar as CalendarIcon } from "lucide-react";
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

export default function StudentBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await api.getMyBookings();
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

  const handleCancelBooking = async (id: string) => {
    setIsUpdating(true);
    try {
      await api.updateBookingStatus(id, "cancelled");
      toast({
        title: "Booking Cancelled",
        description: "Your session request has been cancelled.",
      });
      fetchBookings();
      setSelectedBooking(null);
    } catch (error) {
      console.error("Cancellation failed:", error);
      toast({
        variant: "destructive",
        title: "Cancellation Failed",
        description: "Could not cancel booking.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getMentor = (booking: Booking | null): User | null => {
      if (!booking || !booking.mentor) return null;
      if (typeof booking.mentor === 'object') {
          return booking.mentor as User;
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Sessions</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your mentorship sessions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
          <CardDescription>
            You have {bookings.filter(b => b.status !== 'cancelled' && b.status !== 'completed').length} active sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mentor</TableHead>
                <TableHead>Topic & Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => {
                  const mentor = getMentor(booking);
                  return (
                    <TableRow key={booking._id}>
                        <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar>
                            <AvatarImage src={mentor?.avatar} />
                            <AvatarFallback>{mentor?.name?.charAt(0) || "M"}</AvatarFallback>
                            </Avatar>
                            <div>
                            <div className="font-medium">{mentor?.name || "Unknown Mentor"}</div>
                            <div className="text-xs text-muted-foreground">{mentor?.email}</div>
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
                                <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => setSelectedBooking(booking)}
                                disabled={isUpdating}
                                >
                                <XCircle className="w-4 h-4 mr-2" /> Cancel
                                </Button>
                            )}
                             {booking.status === 'confirmed' && booking.meetingLink && (
                                <Button 
                                size="sm" 
                                variant="default"
                                asChild
                                >
                                <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer">
                                   <Video className="w-4 h-4 mr-2" /> Join
                                </a>
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
      
      {/* Cancellation Confirmation Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Cancel Session?</DialogTitle>
                <DialogDescription>
                    Are you sure you want to cancel the session with {getMentor(selectedBooking)?.name}? This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedBooking(null)}>Keep Session</Button>
                <Button 
                    variant="destructive"
                    onClick={() => selectedBooking && handleCancelBooking(selectedBooking._id)}
                    disabled={isUpdating}
                >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Yes, Cancel"}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
