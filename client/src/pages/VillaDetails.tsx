import { useRoute } from "wouter";
import { useVilla } from "@/hooks/use-villas";
import { Layout } from "@/components/Layout";
import { BookingWidget } from "@/components/BookingWidget";
import { Skeleton } from "@/components/ui/skeleton";
import { Share, Heart, Star, MapPin, Wifi, Car, ChefHat, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function VillaDetails() {
  const [match, params] = useRoute("/villas/:id");
  const id = params ? parseInt(params.id) : 0;
  const { data: villa, isLoading } = useVilla(id);

  if (isLoading) {
    return (
      <Layout>
        <div className="container-padding py-6 space-y-8 animate-pulse">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[400px]">
            <Skeleton className="md:col-span-2 h-full rounded-l-xl" />
            <div className="hidden md:grid grid-rows-2 gap-2 h-full">
              <Skeleton className="h-full" />
              <Skeleton className="h-full" />
            </div>
            <div className="hidden md:grid grid-rows-2 gap-2 h-full">
              <Skeleton className="h-full rounded-tr-xl" />
              <Skeleton className="h-full rounded-br-xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!villa) return <Layout><div>Villa not found</div></Layout>;

  return (
    <Layout>
      <div className="container-padding py-6 max-w-6xl mx-auto">
        {/* Title Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 text-foreground">{villa.title}</h1>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-medium underline">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span>{villa.rating} · {villa.reviewCount} reviews</span>
              <span className="mx-1">·</span>
              <span className="text-muted-foreground no-underline">{villa.location}</span>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" className="gap-2 underline decoration-1">
                <Share className="w-4 h-4" /> Share
              </Button>
              <Button variant="ghost" size="sm" className="gap-2 underline decoration-1">
                <Heart className="w-4 h-4" /> Save
              </Button>
            </div>
          </div>
        </div>

        {/* Images Grid - Unsplash Style */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[300px] md:h-[500px] rounded-xl overflow-hidden mb-12 relative">
          <div className="md:col-span-2 h-full">
            <img src={villa.images[0]} alt="Main" className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer" />
          </div>
          <div className="hidden md:flex flex-col gap-2 h-full">
            <img src={villa.images[1] || villa.images[0]} alt="Interior" className="w-full h-1/2 object-cover hover:opacity-95 transition-opacity cursor-pointer" />
            <img src={villa.images[2] || villa.images[0]} alt="Detail" className="w-full h-1/2 object-cover hover:opacity-95 transition-opacity cursor-pointer" />
          </div>
          <div className="hidden md:flex flex-col gap-2 h-full">
            <img src={villa.images[3] || villa.images[0]} alt="Bedroom" className="w-full h-1/2 object-cover hover:opacity-95 transition-opacity cursor-pointer" />
            <div className="relative h-1/2">
              <img src={villa.images[4] || villa.images[0]} alt="View" className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer" />
              <Button variant="secondary" className="absolute bottom-4 right-4 text-xs">Show all photos</Button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_370px] gap-12">
          
          {/* Left Column */}
          <div className="space-y-8">
            <div className="flex justify-between items-center pb-8 border-b">
              <div>
                <h2 className="text-2xl font-bold font-display mb-1">Entire villa hosted by {villa.hostId}</h2>
                <p className="text-muted-foreground">{villa.maxGuests} guests · 4 bedrooms · 3 baths</p>
              </div>
              <Avatar className="w-14 h-14 border">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${villa.hostId}`} />
                <AvatarFallback>HO</AvatarFallback>
              </Avatar>
            </div>

            {/* Highlights */}
            <div className="space-y-6 pb-8 border-b">
              <div className="flex gap-4">
                <div className="mt-1"><MapPin className="w-6 h-6 text-foreground" /></div>
                <div>
                  <h3 className="font-semibold text-foreground">Great location</h3>
                  <p className="text-sm text-muted-foreground">95% of recent guests gave the location a 5-star rating.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1"><Wifi className="w-6 h-6 text-foreground" /></div>
                <div>
                  <h3 className="font-semibold text-foreground">Fast Wifi</h3>
                  <p className="text-sm text-muted-foreground">At 124 Mbps, you can take video calls and stream videos.</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pb-8 border-b">
              <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
                {villa.description}
              </p>
              <button className="mt-4 font-semibold underline flex items-center">
                Show more <span className="ml-1">→</span>
              </button>
            </div>

            {/* Amenities */}
            <div className="pb-8 border-b">
              <h2 className="text-xl font-bold font-display mb-6">What this place offers</h2>
              <div className="grid grid-cols-2 gap-4">
                {villa.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    {/* Simple amenity icon mapping logic could go here */}
                    <div className="w-6"><Star className="w-5 h-5 text-muted-foreground" /></div>
                    <span>{amenity}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3"><Car className="w-5 h-5 text-muted-foreground" /><span className="ml-3">Free parking on premises</span></div>
                <div className="flex items-center gap-3"><ChefHat className="w-5 h-5 text-muted-foreground" /><span className="ml-3">Kitchen</span></div>
                <div className="flex items-center gap-3"><Coffee className="w-5 h-5 text-muted-foreground" /><span className="ml-3">Coffee maker</span></div>
              </div>
              <Button variant="outline" className="mt-8">Show all amenities</Button>
            </div>
          </div>

          {/* Right Column - Sticky Booking Widget */}
          <div className="relative">
            <BookingWidget villa={villa} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
