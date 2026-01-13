import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MentorBookings from "./MentorBookings";
import MentorMessages from "./MentorMessages";
import api, { Mentor } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, MessageSquare, Star, Users } from "lucide-react";

export default function MentorDashboard() {
  const [mentorProfile, setMentorProfile] = useState<Mentor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMentorStatus = async () => {
      try {
        const profile = await api.getMyMentorProfile();
        if (!profile || profile.status !== 'approved') {
           navigate('/dashboard'); // Not a mentor, redirect
           return;
        }
        setMentorProfile(profile);
      } catch (error) {
        console.error("Failed to load mentor profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkMentorStatus();
  }, [navigate]);

  if (isLoading) {
    return <div className="p-8 space-y-4">
        <Skeleton className="h-12 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96 w-full" />
    </div>;
  }

  if (!mentorProfile) {
      return (
          <div className="p-8 text-center">
              <h2 className="text-xl font-bold text-destructive">Error Loading Dashboard</h2>
              <p className="text-muted-foreground">Could not load mentor profile. Please try refreshing.</p>
          </div>
      );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mentor Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Manage your sessions, requests, and messages.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">{mentorProfile.totalSessions}</div>
            <p className="text-xs text-muted-foreground">Lifetime completed sessions</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">{mentorProfile.rating}</div>
            <p className="text-xs text-muted-foreground">Average feedback score</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">Messages answered</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Unique students mentored</p>
            </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="bookings">Requests</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>
        <TabsContent value="bookings" className="space-y-4">
           <MentorBookings mode="requests" />
        </TabsContent>
        <TabsContent value="sessions" className="space-y-4">
           <MentorBookings mode="sessions" />
        </TabsContent>
        <TabsContent value="messages" className="space-y-4">
           <MentorMessages />
        </TabsContent>
      </Tabs>
    </div>
  );
}
