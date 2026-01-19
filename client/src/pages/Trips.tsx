import { Layout } from "@/components/Layout";
import { useTrips, useUpdateBooking } from "@/hooks/use-bookings";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MapPin, XCircle } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Trips() {
  const { user, isAuthenticated } = useAuth();
  const { data: trips, isLoading } = useTrips();
  const updateBooking = useUpdateBooking();
  const { toast } = useToast();

  const handleCancel = (id: number) => {
      if (confirm("Are you sure you want to cancel this booking?")) {
          updateBooking.mutate({ id, status: "cancelled" });
      }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <h2 className="text-2xl font-bold font-display">Log in to view your trips</h2>
          <Button onClick={() => window.location.href = "/?login=true"}>Log In</Button>
        </div>
      </Layout>
    );
  }

  // Group trips by status (upcoming vs past/cancelled)
  const now = new Date();
  const upcoming = trips?.filter(t => new Date(t.booking.endDate) >= now && t.booking.status !== "cancelled" && t.booking.status !== "rejected") || [];
  const past = trips?.filter(t => new Date(t.booking.endDate) < now || t.booking.status === "cancelled" || t.booking.status === "rejected") || [];

  return (
    <Layout>
      <div className="container-padding py-10">
        <h1 className="text-3xl font-display font-bold mb-8">Trips</h1>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : trips && trips.length > 0 ? (
          <div className="space-y-12">
            {/* Upcoming Trips */}
            <section>
                <h2 className="text-xl font-bold mb-4">Upcoming reservations</h2>
                {upcoming.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcoming.map(({ booking, villa }) => (
                            <div key={booking.id} className="border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                                <Link href={`/villas/${villa.id}`}>
                                    <div className="aspect-video bg-muted relative cursor-pointer">
                                        <img
                                            src={villa.images[0]}
                                            className="w-full h-full object-cover"
                                            alt={villa.title}
                                        />
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                                            {booking.status}
                                        </div>
                                    </div>
                                </Link>
                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg line-clamp-1">{villa.title}</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{villa.location}</p>

                                    <div className="flex items-center text-muted-foreground text-sm mb-4">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {format(new Date(booking.startDate), "MMM d")} - {format(new Date(booking.endDate), "MMM d, yyyy")}
                                    </div>

                                    <div className="mt-auto pt-4 border-t flex justify-between items-center">
                                        <div className="flex flex-col">
                                             <span className="text-xs text-muted-foreground">Total</span>
                                             <span className="font-bold text-lg">${booking.totalPrice}</span>
                                        </div>
                                        {booking.status === 'pending' || booking.status === 'confirmed' ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleCancel(booking.id)}
                                                disabled={updateBooking.isPending}
                                            >
                                                Cancel
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 bg-muted/20 rounded-xl text-center">
                        <p className="text-muted-foreground">No upcoming trips booked... yet!</p>
                        <Link href="/">
                          <Button variant="link" className="mt-2">Start exploring</Button>
                        </Link>
                    </div>
                )}
            </section>

            {/* Past Trips */}
            {past.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold mb-4">Where you've been</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {past.map(({ booking, villa }) => (
                            <div key={booking.id} className="border rounded-2xl overflow-hidden shadow-sm flex flex-col h-full opacity-80 hover:opacity-100 transition-opacity">
                                <Link href={`/villas/${villa.id}`}>
                                    <div className="aspect-video bg-muted relative cursor-pointer grayscale-[30%]">
                                        <img
                                            src={villa.images[0]}
                                            className="w-full h-full object-cover"
                                            alt={villa.title}
                                        />
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            {booking.status}
                                        </div>
                                    </div>
                                </Link>
                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="font-bold text-lg line-clamp-1">{villa.title}</h3>
                                    <div className="flex items-center text-muted-foreground text-sm mt-2">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {format(new Date(booking.startDate), "MMM d, yyyy")}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
          </div>
        ) : (
          <div className="py-12 border-t text-center">
            <h2 className="text-2xl font-bold mb-2">No trips booked... yet!</h2>
            <p className="text-muted-foreground mb-6">Time to dust off your bags and start planning your next adventure.</p>
            <Link href="/">
              <Button size="lg" className="font-semibold">Start exploring</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
