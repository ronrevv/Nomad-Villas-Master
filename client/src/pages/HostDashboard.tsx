import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useVillas } from "@/hooks/use-villas";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, MessageSquare, Calendar as CalendarIcon, Home, DollarSign, Check, X } from "lucide-react";
import { VillaCard } from "@/components/VillaCard";
import { useLocation, Redirect } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Booking, Message, User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUpdateBooking } from "@/hooks/use-bookings";

export default function HostDashboard() {
  const { user } = useAuth();
  const { data: villas } = useVillas();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [replyContent, setReplyContent] = useState("");
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  const updateBooking = useUpdateBooking();

  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ['/api/bookings/host'],
    queryFn: async () => {
      const res = await fetch(api.bookings.hostList.path);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
    enabled: !!user
  });

  const { data: allUsers } = useQuery<User[]>({
      queryKey: ['/api/users'],
      queryFn: async () => {
          const res = await fetch("/api/users");
          if (!res.ok) throw new Error("Failed to fetch users");
          return res.json();
      },
      enabled: user?.role === "admin"
  });

  const { data: messages } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
    queryFn: async () => {
      const res = await fetch(api.messages.list.path);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!user
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { receiverId: string, content: string }) => {
      const res = await fetch(api.messages.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, senderId: user?.id }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      setReplyContent("");
      setActiveMessageId(null);
      toast({ title: "Message sent" });
    }
  });

  // Effect to redirect guests (moved up to avoid hook order issues)
  useEffect(() => {
    if (user?.role === "guest") {
      setLocation("/");
    }
  }, [user, setLocation]);

  const myVillas = villas?.filter(v => v.hostId === user?.id) || [];

  // Calculate earnings (simple mock)
  const totalEarnings = bookings?.reduce((acc, b) => acc + (b.totalPrice || 0), 0) || 0;
  const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0;
  const confirmedBookings = bookings?.filter(b => b.status === 'confirmed').length || 0;

  // Group messages by user (simple threading)
  const conversations = messages?.reduce((acc, msg) => {
    const otherId = msg.senderId === user?.id ? msg.receiverId : msg.senderId;
    if (!acc[otherId]) acc[otherId] = [];
    acc[otherId].push(msg);
    return acc;
  }, {} as Record<string, Message[]>) || {};

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Please log in to manage listings</h2>
            <Button onClick={() => window.location.href = "/?login=true"}>Log In</Button>
          </div>
        </div>
      </Layout>
    );
  }
  if (user.role === "guest") {
      return null;
  }

  if (user.role === "admin") {
      const hosts = allUsers?.filter(u => u.role === "host") || [];
      return (
          <Layout>
              <div className="container-padding py-10">
                  <h1 className="text-3xl font-display font-bold mb-8">Admin Dashboard</h1>
                  <div className="space-y-8">
                      {hosts.length === 0 && <p>No hosts found.</p>}
                      {hosts.map(host => {
                          const hostVillas = villas?.filter(v => v.hostId === host.id) || [];
                          return (
                              <Card key={host.id}>
                                  <CardHeader>
                                      <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
                                            <img src={host.profileImageUrl || ""} className="w-full h-full object-cover" alt={host.username || ""} />
                                          </div>
                                          <div>
                                              <CardTitle>{host.firstName} {host.lastName} (@{host.username})</CardTitle>
                                              <CardDescription>{host.email}</CardDescription>
                                          </div>
                                      </div>
                                  </CardHeader>
                                  <CardContent>
                                      <h4 className="font-semibold mb-4">Listings ({hostVillas.length})</h4>
                                      {hostVillas.length > 0 ? (
                                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                              {hostVillas.map(villa => (
                                                  <VillaCard key={villa.id} villa={villa} />
                                              ))}
                                          </div>
                                      ) : (
                                          <p className="text-muted-foreground text-sm">No listings.</p>
                                      )}
                                  </CardContent>
                              </Card>
                          )
                      })}
                  </div>
              </div>
          </Layout>
      );
  }

  // Identify booked dates for the calendar
  const bookedDates: Date[] = [];
  bookings?.forEach(b => {
    if (b.status === 'confirmed') {
        const start = new Date(b.startDate);
        const end = new Date(b.endDate);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            bookedDates.push(new Date(d));
        }
    }
  });

  return (
    <Layout>
      <div className="container-padding py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Hosting Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.firstName || user.username}!</p>
          </div>
          <Button
            className="bg-primary text-white hover:bg-primary/90"
            onClick={() => setLocation("/become-a-host")}
          >
            <Plus className="w-4 h-4 mr-2" /> Create New Listing
          </Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-8 w-full justify-start h-auto p-1 bg-muted/50 rounded-xl overflow-x-auto">
            <TabsTrigger value="overview" className="px-6 py-3 data-[state=active]:bg-background rounded-lg"><DollarSign className="w-4 h-4 mr-2"/> Overview</TabsTrigger>
            <TabsTrigger value="calendar" className="px-6 py-3 data-[state=active]:bg-background rounded-lg"><CalendarIcon className="w-4 h-4 mr-2"/> Calendar</TabsTrigger>
            <TabsTrigger value="listings" className="px-6 py-3 data-[state=active]:bg-background rounded-lg"><Home className="w-4 h-4 mr-2"/> Listings ({myVillas.length})</TabsTrigger>
            <TabsTrigger value="inbox" className="px-6 py-3 data-[state=active]:bg-background rounded-lg"><MessageSquare className="w-4 h-4 mr-2"/> Inbox</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">${totalEarnings.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{confirmedBookings}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{pendingBookings}</div>
                    </CardContent>
                </Card>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">Recent Bookings</h3>
            <div className="space-y-4">
                {bookings && bookings.length > 0 ? bookings.slice(0, 5).map(booking => (
                    <Card key={booking.id} className="flex items-center p-4 gap-4">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                            {booking.guestCount}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold">Booking #{booking.id}</h4>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(booking.startDate), "MMM d")} - {format(new Date(booking.endDate), "MMM d, yyyy")}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="font-bold">${booking.totalPrice}</div>
                            <div className={`text-xs capitalize px-2 py-1 rounded-full inline-block mt-1 ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-secondary'}`}>
                                {booking.status}
                            </div>
                        </div>
                    </Card>
                )) : (
                     <div className="text-center py-10 bg-muted/20 rounded-xl">No bookings yet.</div>
                )}
            </div>
          </TabsContent>

          {/* CALENDAR TAB */}
          <TabsContent value="calendar" className="flex flex-col md:flex-row gap-8">
             <div className="flex-1">
                <Card className="p-4">
                    <Calendar
                        mode="multiple"
                        selected={bookedDates}
                        className="rounded-md border mx-auto"
                    />
                </Card>
             </div>
             <div className="flex-1">
                 <h3 className="font-bold text-xl mb-4">Manage Bookings</h3>
                 <div className="space-y-4 h-[400px] overflow-y-auto pr-2">
                     {bookings?.sort((a,b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()).map(booking => (
                         <div key={booking.id} className="border p-4 rounded-lg flex justify-between items-center bg-card">
                             <div>
                                 <div className="font-semibold flex items-center gap-2">
                                     {format(new Date(booking.startDate), "MMM d")} - {format(new Date(booking.endDate), "MMM d")}
                                     {booking.status === 'pending' && <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full">New</span>}
                                 </div>
                                 <div className="text-sm text-muted-foreground">{booking.guestCount} Guests • ${booking.totalPrice}</div>
                             </div>

                             <div className="flex gap-2">
                                 {booking.status === 'pending' ? (
                                     <>
                                         <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 w-8 p-0 border-green-500 text-green-600 hover:bg-green-50"
                                            onClick={() => updateBooking.mutate({ id: booking.id, status: 'confirmed' })}
                                            disabled={updateBooking.isPending}
                                         >
                                             <Check className="w-4 h-4" />
                                         </Button>
                                         <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 w-8 p-0 border-red-500 text-red-600 hover:bg-red-50"
                                            onClick={() => updateBooking.mutate({ id: booking.id, status: 'rejected' })}
                                            disabled={updateBooking.isPending}
                                         >
                                             <X className="w-4 h-4" />
                                         </Button>
                                     </>
                                 ) : (
                                     <div className={`px-3 py-1 rounded-full text-sm font-medium ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-secondary'}`}>
                                         {booking.status}
                                     </div>
                                 )}
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
          </TabsContent>

          {/* LISTINGS TAB */}
          <TabsContent value="listings">
             {myVillas.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {myVillas.map(villa => (
                        <VillaCard key={villa.id} villa={villa} />
                    ))}
                 </div>
             ) : (
                <div className="text-center py-20 bg-muted/20 rounded-xl">
                  <h3 className="text-lg font-medium">No listings yet</h3>
                  <p className="text-muted-foreground">Create your first listing to start hosting.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setLocation("/become-a-host")}>Create Listing</Button>
                </div>
             )}
          </TabsContent>
          
          {/* INBOX TAB */}
           <TabsContent value="inbox">
            {/* Same as before... */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
                {/* Conversation List */}
                <Card className="md:col-span-1 overflow-hidden flex flex-col">
                    <CardHeader className="bg-muted/50 py-3">
                        <CardTitle className="text-md">Messages</CardTitle>
                    </CardHeader>
                    <div className="flex-1 overflow-y-auto">
                        {Object.entries(conversations).map(([otherId, msgs]) => (
                            <div
                                key={otherId}
                                className="p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={() => setActiveMessageId(otherId)}
                            >
                                <div className="font-semibold mb-1">Guest {otherId}</div>
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                    {msgs[msgs.length - 1].content}
                                </div>
                                <div className="text-xs text-muted-foreground mt-2 text-right">
                                    {format(new Date(msgs[msgs.length - 1].createdAt || new Date()), "MMM d")}
                                </div>
                            </div>
                        ))}
                        {Object.keys(conversations).length === 0 && (
                            <div className="p-8 text-center text-muted-foreground">No messages yet.</div>
                        )}
                    </div>
                </Card>

                {/* Conversation View */}
                <Card className="md:col-span-2 flex flex-col overflow-hidden">
                    {activeMessageId ? (
                        <>
                            <CardHeader className="bg-muted/50 py-3 border-b">
                                <CardTitle className="text-md">Conversation</CardTitle>
                            </CardHeader>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
                                {conversations[activeMessageId]?.sort((a,b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()).map(msg => {
                                    const isMe = msg.senderId === user?.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none'}`}>
                                                <p className="text-sm">{msg.content}</p>
                                                <div className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                    {format(new Date(msg.createdAt!), "h:mm a")}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="p-4 border-t bg-background">
                                <form
                                    className="flex gap-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if(!replyContent.trim()) return;
                                        sendMessageMutation.mutate({
                                            receiverId: String(activeMessageId),
                                            content: replyContent
                                        });
                                    }}
                                >
                                    <Input
                                        placeholder="Type a message..."
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button type="submit" disabled={sendMessageMutation.isPending}>
                                        <MessageSquare className="w-4 h-4" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                            <p>Select a conversation to start messaging</p>
                        </div>
                    )}
                </Card>
            </div>
           </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
