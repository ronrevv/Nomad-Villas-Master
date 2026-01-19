import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useCreateVilla, useVillas } from "@/hooks/use-villas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVillaSchema, type InsertVilla } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Upload, Trash2 } from "lucide-react";
import { useState } from "react";
import { VillaCard } from "@/components/VillaCard";

export default function HostDashboard() {
  const { user } = useAuth();
  const createVilla = useCreateVilla();
  const { data: villas } = useVillas();
  const [isCreating, setIsCreating] = useState(false);

  // Filter villas for this host (mock filter as API returns all)
  const myVillas = villas?.filter(v => v.hostId === user?.id) || [];

  const form = useForm<InsertVilla>({
    resolver: zodResolver(insertVillaSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      pricePerNight: 0,
      maxGuests: 2,
      amenities: ["Wifi", "Kitchen", "Pool"],
      images: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80"
      ], // Placeholder images
      hostId: user?.id || "",
    },
  });

  const onSubmit = (data: InsertVilla) => {
    createVilla.mutate({ ...data, hostId: user?.id || "" }, {
        onSuccess: () => {
            setIsCreating(false);
            form.reset();
        }
    });
  };

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
            onClick={() => setIsCreating(!isCreating)}
          >
            {isCreating ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Create New Listing</>}
          </Button>
        </div>

        {isCreating ? (
            <div className="max-w-2xl mx-auto mb-10">
              <Card>
                <CardHeader>
                  <CardTitle>List a new property</CardTitle>
                  <CardDescription>Fill out the details below to publish your villa.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Listing Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Modern Beachfront Villa" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Bali, Indonesia" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="pricePerNight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price per night ($)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="maxGuests"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Guests</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Describe your property..." className="h-32" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="rounded-lg border border-dashed p-8 text-center bg-muted/20">
                         <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                           <Upload className="h-6 w-6 text-muted-foreground" />
                         </div>
                         <h3 className="mt-2 text-sm font-semibold text-foreground">Upload photos</h3>
                         <p className="mt-1 text-sm text-muted-foreground">Drag and drop or click to upload</p>
                         <p className="text-xs text-muted-foreground mt-2">(We'll use stock photos for this demo)</p>
                      </div>

                      <Button type="submit" className="w-full" disabled={createVilla.isPending}>
                        {createVilla.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...
                          </>
                        ) : (
                          "Publish Listing"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
        ) : null}

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
                  <Button variant="outline" className="mt-4" onClick={() => setIsCreating(true)}>Create Listing</Button>
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
