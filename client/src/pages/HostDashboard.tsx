import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useVillas } from "@/hooks/use-villas";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { VillaCard } from "@/components/VillaCard";
import { useLocation } from "wouter";

export default function HostDashboard() {
  const { user } = useAuth();
  const { data: villas } = useVillas();
  const [, setLocation] = useLocation();

  // Filter villas for this host (mock filter as API returns all)
  const myVillas = villas?.filter(v => v.hostId === user?.id) || [];

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Please log in to manage listings</h2>
            <Button onClick={() => window.location.reload()}>Log In</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-padding py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Host Dashboard</h1>
            <p className="text-muted-foreground">Manage your listings and bookings.</p>
          </div>
          <Button
            className="bg-foreground text-background hover:bg-foreground/90"
            onClick={() => setLocation("/become-a-host")}
          >
            <Plus className="w-4 h-4 mr-2" /> Create New Listing
          </Button>
        </div>

        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="bookings">Upcoming Bookings</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

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
          
          <TabsContent value="bookings">
            <div className="text-center py-20 bg-muted/20 rounded-xl">
              <h3 className="text-lg font-medium">No upcoming bookings</h3>
              <p className="text-muted-foreground">When guests book your villas, they'll show up here.</p>
            </div>
          </TabsContent>

           <TabsContent value="earnings">
            <div className="text-center py-20 bg-muted/20 rounded-xl">
              <h3 className="text-lg font-medium">No earnings yet</h3>
              <p className="text-muted-foreground">Start hosting to earn money.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
