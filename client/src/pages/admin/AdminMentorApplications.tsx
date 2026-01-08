import { useState, useEffect } from "react";
import api, { Mentor } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, ExternalLink, Loader2, Eye, Calendar, DollarSign, Briefcase, BookOpen, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminMentorApplications() {
  const [applications, setApplications] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Mentor | null>(null);
  const [appToDelete, setAppToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await api.getMentorApplications();
      setApplications(data);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load mentor applications.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: "approved" | "rejected") => {
    try {
      await api.updateMentorApplication(id, status);
      toast({
        title: `Application ${status}`,
        description: `The mentor application has been ${status}.`,
      });
      fetchApplications(); // Refresh list
      if (selectedApp) setSelectedApp(null); // Close dialog if open and status changed
    } catch {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update application status.",
      });
    }
  };

  const handleDelete = async () => {
    if (!appToDelete) return;
    try {
      await api.deleteMentorApplication(appToDelete);
      toast({
        title: "Application Deleted",
        description: "The mentor application has been permanently deleted.",
      });
      fetchApplications();
      setAppToDelete(null);
      if (selectedApp && selectedApp._id === appToDelete) setSelectedApp(null);
    } catch {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not delete mentor application.",
      });
    }
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
        <h1 className="text-3xl font-bold tracking-tight">Mentor Applications</h1>
        <p className="text-muted-foreground mt-2">
          Review and manage applications from users who want to become mentors.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mentor Applications</CardTitle>
          <CardDescription>
            {applications.filter(app => app.status === 'pending' || !app.status).length} pending, {applications.length} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Expertise</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No applications found.
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={(app.user as any)?.avatar} />
                          <AvatarFallback>{(app.user as any)?.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{(app.user as any)?.name || "Unknown User"}</div>
                          <div className="text-xs text-muted-foreground">{(app.user as any)?.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {app.expertise.slice(0, 3).map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                        {app.expertise.length > 3 && <span className="text-xs text-muted-foreground">+{app.expertise.length - 3}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={app.experience}>
                      {app.experience}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          app.status === "approved" ? "default" : 
                          app.status === "rejected" ? "destructive" : "outline"
                        }
                      >
                        {app.status || "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                           size="sm"
                           variant="outline"
                           onClick={() => setSelectedApp(app)}
                        >
                           <Eye className="w-4 h-4 mr-2" />
                           View
                        </Button>
                        
                        {(app.status === 'pending' || !app.status) ? (
                          <>
                            <Button 
                              size="sm" 
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleStatusUpdate(app._id, "approved")}
                              title="Approve"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleStatusUpdate(app._id, "rejected")}
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                             // Allow delete regardless of status if admin wants to clean up
                            <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => setAppToDelete(app._id)}
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                        
                        {/* Always show delete for rejected apps or if needed */}
                        {(app.status === 'pending' || !app.status) && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => setAppToDelete(app._id)}
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
         <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
               <DialogTitle>Mentor Application Review</DialogTitle>
               <DialogDescription>
                  Review the full details submitted by the applicant.
               </DialogDescription>
            </DialogHeader>

            {selectedApp && (
               <div className="space-y-6">
                  {/* User Profile Header in Dialog */}
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                     <Avatar className="w-16 h-16">
                        <AvatarImage src={(selectedApp.user as any)?.avatar} />
                        <AvatarFallback>{(selectedApp.user as any)?.name?.charAt(0) || "U"}</AvatarFallback>
                     </Avatar>
                     <div>
                        <h3 className="text-lg font-bold">{(selectedApp.user as any)?.name || "Unknown User"}</h3>
                        <p className="text-muted-foreground">{(selectedApp.user as any)?.email}</p>
                        <Badge variant={selectedApp.status === 'approved' ? 'default' : selectedApp.status === 'rejected' ? 'destructive' : 'outline'} className="mt-2">
                           {selectedApp.status || 'pending'}
                        </Badge>
                     </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                     <div className="space-y-1">
                        <h4 className="flex items-center gap-2 font-semibold text-primary">
                           <DollarSign className="w-4 h-4" /> Hourly Rate
                        </h4>
                        <p className="text-lg font-medium">${selectedApp.hourlyRate}/hr</p>
                     </div>
                     <div className="space-y-1">
                        <h4 className="flex items-center gap-2 font-semibold text-primary">
                           <Calendar className="w-4 h-4" /> Availability
                        </h4>
                        {/* Assuming availability is a string for now based on previous edits, if object adjust */}
                        <p>{(selectedApp as any).availability || "Not specified"}</p>
                     </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                     <h4 className="flex items-center gap-2 font-semibold text-primary">
                        <BookOpen className="w-4 h-4" /> Areas of Expertise
                     </h4>
                     <div className="flex flex-wrap gap-2">
                        {selectedApp.expertise.map((skill, i) => (
                           <Badge key={i} variant="secondary">{skill}</Badge>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-2">
                     <h4 className="flex items-center gap-2 font-semibold text-primary">
                        <Briefcase className="w-4 h-4" /> Professional Experience
                     </h4>
                     <p className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/30 p-3 rounded-md">
                        {selectedApp.experience}
                     </p>
                  </div>

                  <div className="space-y-2">
                     <h4 className="font-semibold text-primary">Bio</h4>
                     <p className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/30 p-3 rounded-md">
                        {selectedApp.bio}
                     </p>
                  </div>

                  {/* Links */}
                  <div className="flex gap-4 pt-2">
                     {selectedApp.linkedin && (
                        <Button variant="outline" size="sm" asChild>
                           <a href={selectedApp.linkedin} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" /> LinkedIn Profile
                           </a>
                        </Button>
                     )}
                     {selectedApp.portfolio && (
                        <Button variant="outline" size="sm" asChild>
                           <a href={selectedApp.portfolio} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" /> Portfolio / Website
                           </a>
                        </Button>
                     )}
                  </div>
               </div>
            )}

            <DialogFooter className="flex gap-2 justify-end mt-4">
               {selectedApp && (
                 <Button 
                    variant="destructive" 
                    className="mr-auto"
                    onClick={() => setAppToDelete(selectedApp._id)}
                 >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                 </Button>
               )}
               
               <Button variant="outline" onClick={() => setSelectedApp(null)}>Close</Button>
               {selectedApp && (selectedApp.status === 'pending' || !selectedApp.status) && (
                  <>
                     <Button 
                        variant="destructive" 
                        onClick={() => handleStatusUpdate(selectedApp._id, 'rejected')}
                     >
                        Reject
                     </Button>
                     <Button 
                        onClick={() => handleStatusUpdate(selectedApp._id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                     >
                        Approve
                     </Button>
                  </>
               )}
            </DialogFooter>
         </DialogContent>
      </Dialog>

      <AlertDialog open={!!appToDelete} onOpenChange={() => setAppToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this mentor application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
