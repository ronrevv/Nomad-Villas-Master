import { useVillas } from "@/hooks/use-villas";
import { VillaCard } from "@/components/VillaCard";
import { Layout } from "@/components/Layout";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/ui/button";
import { Search, Map as MapIcon, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import VillaMap from "@/components/VillaMap";
import { useLocation } from "wouter";

export default function Home() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const filters = {
    location: searchParams.get("location") || undefined,
    guests: searchParams.get("guests") ? Number(searchParams.get("guests")) : undefined
  };

  const { data: villas, isLoading } = useVillas(filters);
  const [showMap, setShowMap] = useState(false);

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
        <div className="container-padding">
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
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 pb-12"
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
        </div>
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
