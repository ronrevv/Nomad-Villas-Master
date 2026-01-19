import { Link } from "wouter";
import { Villa } from "@shared/schema";
import { Star, Heart } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites, useToggleFavorite } from "@/hooks/use-villas";

interface VillaCardProps {
  villa: Villa;
}

export function VillaCard({ villa }: VillaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { isAuthenticated } = useAuth();
  const { data: favorites } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  const isFavorited = favorites?.some(f => f.id === villa.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
      e.preventDefault(); // Prevent link navigation
      e.stopPropagation();
      if (!isAuthenticated) {
          window.location.href = "/?login=true"; // Simple redirect
          return;
      }
      toggleFavorite.mutate(villa.id);
  };

  return (
    <Link href={`/villas/${villa.id}`}>
      <motion.div 
        className="group cursor-pointer flex flex-col gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-[20/19] overflow-hidden rounded-xl bg-muted">
          <img 
            src={villa.images[0]} 
            alt={villa.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <button
            className="absolute top-3 right-3 p-2 rounded-full hover:bg-background/10 hover:backdrop-blur-sm transition-all"
            onClick={handleFavoriteClick}
          >
            <Heart
                className={`w-6 h-6 drop-shadow-md ${isFavorited ? "fill-red-500 text-red-500" : "text-white"}`}
            />
          </button>
          
          {/* Host/Badge Overlay could go here */}
          {villa.rating > 4.8 && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur rounded-md text-xs font-bold shadow-sm">
              Guest Favorite
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-foreground truncate pr-4">{villa.location}</h3>
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{villa.rating > 0 ? villa.rating.toFixed(2) : "New"}</span>
            </div>
          </div>
          <p className="text-muted-foreground text-sm truncate">{villa.title}</p>
          <p className="text-muted-foreground text-sm">Oct 23 - 28</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-semibold">${villa.pricePerNight}</span>
            <span className="text-sm text-foreground">night</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
