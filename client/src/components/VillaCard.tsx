import { Link } from "wouter";
import { Villa } from "@shared/schema";
import { Star, Heart } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useVillas, useFavorites, useToggleFavorite } from "@/hooks/use-villas";
import { useLoginModal } from "@/hooks/use-login-modal";

interface VillaCardProps {
  villa: Villa;
}

export function VillaCard({ villa }: VillaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { isAuthenticated } = useAuth();
  const { data: favorites } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const loginModal = useLoginModal();

  const isFavorited = favorites?.some(f => f.id === villa.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
      e.preventDefault(); // Prevent link navigation
      e.stopPropagation();
      if (!isAuthenticated) {
          loginModal.openLogin();
          return;
      }
      toggleFavorite.mutate(villa.id);
  };

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % villa.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + villa.images.length) % villa.images.length);
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
          <div className="absolute inset-0 transition-transform duration-500">
            <img
              src={villa.images[currentImageIndex]}
              alt={villa.title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Image Navigation Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {villa.images.slice(0, 5).map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all ${idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/60'}`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            className={`absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 disabled:opacity-0 ${currentImageIndex === 0 ? 'hidden' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-black"><path d="m15 18-6-6 6-6"/></svg>
          </button>

          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-black"><path d="m9 18 6-6-6-6"/></svg>
          </button>

          <button
            className="absolute top-3 right-3 p-2 rounded-full hover:bg-black/10 transition-all z-10"
            onClick={handleFavoriteClick}
          >
            <Heart
                className={`w-6 h-6 drop-shadow-md transition-colors ${isFavorited ? "fill-red-500 text-red-500" : "text-white/70 hover:text-white"}`}
            />
          </button>
          
          {/* Host/Badge Overlay */}
          {villa.rating > 4.8 && (
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold shadow-sm text-foreground">
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
