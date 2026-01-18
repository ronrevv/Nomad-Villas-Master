import { useVillas } from "@/hooks/use-villas";
import { VillaCard } from "@/components/VillaCard";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: villas, isLoading } = useVillas();

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
      {/* Category Bar */}
      <div className="sticky top-20 z-40 bg-background pt-4 pb-2 shadow-sm mb-6">
        <div className="container-padding overflow-x-auto no-scrollbar">
          <div className="flex gap-8 min-w-max px-2">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 pb-12">
            {villas?.map((villa) => (
              <VillaCard key={villa.id} villa={villa} />
            ))}
          </div>
        )}
        
        {!isLoading && villas?.length === 0 && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-display font-bold mb-2">No villas found</h2>
            <p className="text-muted-foreground mb-6">Try adjusting your search filters.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Reset Filters</Button>
          </div>
        )}
      </div>

      {/* Floating Map Toggle (Desktop) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 hidden md:block">
        <Button className="rounded-full shadow-xl px-6 bg-foreground text-background hover:bg-foreground/90 hover:scale-105 transition-all duration-300">
          Show map
          <span className="ml-2">🗺️</span>
        </Button>
      </div>
    </Layout>
  );
}
