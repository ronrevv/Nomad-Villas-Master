import { useVillas } from "@/hooks/use-villas";
import { VillaCard } from "@/components/VillaCard";
import { Layout } from "@/components/Layout";
import { Hero } from "@/components/Hero";
import { Testimonials } from "@/components/Testimonials";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Search, Map as MapIcon, List, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import VillaMap from "@/components/VillaMap";
import { useLocation, Link, useSearch } from "wouter";

export default function Home() {
  const [location] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const filters = {
    location: searchParams.get("location") || undefined,
    guests: searchParams.get("guests") ? Number(searchParams.get("guests")) : undefined,
    startDate: searchParams.get("from") || undefined,
    endDate: searchParams.get("to") || undefined,
  };

  const { data: villas, isLoading } = useVillas(filters);
  const [showMap, setShowMap] = useState(false);

  // Top rated villas (> 4.7)
  const topRatedVillas = villas?.filter(v => v.rating >= 4.7).slice(0, 4);

  const categories = [
    { icon: "🏝️", label: "Islands" },
    { icon: "🏰", label: "Mansions" },
    { icon: "🏊", label: "Amazing Pools" },
    { icon: "⛰️", label: "Views" },
    { icon: "📐", label: "Design" },
    { icon: "❄️", label: "Arctic" },
    { icon: "🏜️", label: "Desert" },
    { icon: "🌲", label: "Cabins" },
    { icon: "🍷", label: "Vineyards" },
  ];

  const hasFilters = filters.location || filters.guests || filters.startDate;

  return (
    <Layout>
      {/* Hero Section */}
      <Hero />

      {/* Category Bar */}
      <div className="sticky top-20 z-40 bg-background/95 backdrop-blur pt-4 pb-2 shadow-sm mb-6 border-b border-border/40">
        <div className="container-padding overflow-x-auto no-scrollbar">
          <div className="flex gap-8 min-w-max px-2 justify-center md:justify-start">
            {categories.map((cat, i) => (
              <button 
                key={i} 
                className={`flex flex-col items-center gap-2 group min-w-[64px] cursor-pointer opacity-70 hover:opacity-100 transition-opacity ${i === 2 ? 'opacity-100 border-b-2 border-foreground pb-2' : 'pb-[10px] hover:border-b-2 hover:border-muted-foreground/30'}`}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                <span className="text-xs font-medium text-foreground whitespace-nowrap">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {showMap ? (
        <div className="h-[calc(100vh-180px)] w-full relative z-0">
           <VillaMap villas={villas || []} className="h-full w-full" />
        </div>
      ) : (
        <>
          <div className="container-padding space-y-20">

            {/* Top Rated Section (Only show if no filters active) */}
            {!hasFilters && !isLoading && topRatedVillas && topRatedVillas.length > 0 && (
              <section>
                 <div className="flex items-center gap-2 mb-8">
                   <Sparkles className="w-6 h-6 text-primary" />
                   <h2 className="text-2xl md:text-3xl font-display font-bold">Guest Favorites</h2>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                   {topRatedVillas.map(villa => (
                     <VillaCard key={villa.id} villa={villa} />
                   ))}
                 </div>
              </section>
            )}

            {/* Main Grid */}
            <section>
              <h2 className="text-2xl font-display font-bold mb-8">
                {hasFilters ? `Stays in ${filters.location || "selected area"}` : "Explore all listings"}
              </h2>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-3">
                      <Skeleton className="aspect-[20/19] rounded-xl" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  ))}
                </div>
              ) : (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, staggerChildren: 0.1 }}
                >
                  {villas?.map((villa) => (
                    <VillaCard key={villa.id} villa={villa} />
                  ))}
                </motion.div>
              )}

              {!isLoading && villas?.length === 0 && (
                <div className="text-center py-20">
                  <h2 className="text-2xl font-display font-bold mb-2">No villas found</h2>
                  <p className="text-muted-foreground mb-6">Try adjusting your search filters.</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>Reset Filters</Button>
                </div>
              )}
            </section>
          </div>

          {/* Testimonials */}
          {!hasFilters && <Testimonials />}

          {/* Become a Host CTA */}
          {!hasFilters && (
            <div className="container-padding py-20">
              <div className="relative rounded-3xl overflow-hidden min-h-[400px] flex items-center">
                 <img
                   src="https://images.unsplash.com/photo-1556912173-3db406ee9183?w=1600"
                   alt="Host your home"
                   className="absolute inset-0 w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-black/40" />
                 <div className="relative z-10 max-w-lg p-12 text-white">
                   <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                     Nomad your home
                   </h2>
                   <p className="text-lg mb-8 font-medium">
                     Turn your extra space into extra income and pursue your passion.
                   </p>
                   <Link href="/host">
                     <Button size="lg" className="bg-white text-black hover:bg-white/90 font-bold text-lg px-8 h-14">
                       Become a Host
                     </Button>
                   </Link>
                 </div>
              </div>
            </div>
          )}

          <Footer />
        </>
      )}

      {/* Floating Map Toggle (Desktop) */}
      <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-30">
        <Button
          className="rounded-full shadow-xl px-6 bg-foreground text-background hover:bg-foreground/90 hover:scale-105 transition-all duration-300"
          onClick={() => setShowMap(!showMap)}
        >
          {showMap ? (
            <>
              Show list <List className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Show map <MapIcon className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </Layout>
  );
}
