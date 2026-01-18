import { Layout } from "@/components/Layout";
import { useBookings } from "@/hooks/use-bookings";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function Trips() {
  const { user, isAuthenticated } = useAuth();
  const { data: bookings, isLoading } = useBookings();

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <h2 className="text-2xl font-bold font-display">Log in to view your trips</h2>
          <Button onClick={() => window.location.href = "/api/login"}>Log In</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-padding py-10">
        <h1 className="text-3xl font-display font-bold mb-8">Trips</h1>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : bookings && bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                <div className="aspect-video bg-muted relative">
                  {/* Mock image - normally would join with villa table */}
                  <img 
                    src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80" 
                    className="w-full h-full object-cover" 
                    alt="Trip" 
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                    {booking.status}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">Villa #{booking.villaId}</h3>
                  </div>
                  <div className="flex items-center text-muted-foreground text-sm mb-4">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                  </div>
                  <div className="mt-auto pt-4 border-t flex justify-between items-center">
                    <span className="font-bold text-lg">${booking.totalPrice}</span>
                    <Button variant="outline" size="sm">View details</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 border-t">
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
