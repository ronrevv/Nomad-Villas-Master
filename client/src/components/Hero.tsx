import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function Hero() {
  return (
    <div className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center bg-black text-white overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop"
          alt="Hero Background"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-6 px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight drop-shadow-lg text-white">
          Find your next <span className="text-primary-foreground">adventure</span>
        </h1>
        <p className="text-lg md:text-xl font-medium drop-shadow-md max-w-2xl mx-auto">
          Discover homes, villas, and unique stays around the world.
        </p>

        {/* Big Search Bar */}
        <div className="bg-white text-black p-2 rounded-full shadow-2xl flex items-center max-w-2xl mx-auto mt-8 transition-transform hover:scale-[1.02]">
          <div className="flex-1 px-6 border-r border-gray-200 py-2 hover:bg-gray-50 rounded-l-full cursor-pointer">
             <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Location</div>
             <div className="text-sm font-semibold text-gray-800">Where are you going?</div>
          </div>
          <div className="hidden md:block flex-1 px-6 border-r border-gray-200 py-2 hover:bg-gray-50 cursor-pointer">
             <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Check in</div>
             <div className="text-sm font-semibold text-gray-800">Add dates</div>
          </div>
          <div className="hidden md:block flex-1 px-6 border-r border-gray-200 py-2 hover:bg-gray-50 cursor-pointer">
             <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Check out</div>
             <div className="text-sm font-semibold text-gray-800">Add dates</div>
          </div>
          <div className="flex-1 pl-6 pr-2 py-2 hover:bg-gray-50 rounded-r-full cursor-pointer flex items-center justify-between">
             <div className="text-left">
               <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Guests</div>
               <div className="text-sm font-semibold text-gray-800">Add guests</div>
             </div>
             <Button size="icon" className="rounded-full h-12 w-12 shrink-0 bg-primary hover:bg-primary/90 text-white shadow-md ml-2">
                <Search className="w-5 h-5" />
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
