import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export function Hero() {
  const [, setLocation] = useLocation();
  const [searchLocation, setSearchLocation] = useState("");
  const [guests, setGuests] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation) params.append("location", searchLocation);
    if (guests) params.append("guests", guests);

    setLocation(`/?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

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
        <div className="bg-white text-black p-2 rounded-full shadow-2xl flex flex-col md:flex-row items-stretch md:items-center max-w-2xl mx-auto mt-8 transition-transform hover:scale-[1.02]">

          {/* Location Input */}
          <div className="flex-1 px-6 py-2 hover:bg-gray-50 rounded-full md:rounded-l-full cursor-pointer relative group">
             <div className="text-xs font-bold uppercase tracking-wider text-gray-500 text-left">Location</div>
             <input
               type="text"
               placeholder="Where are you going?"
               className="w-full text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent"
               value={searchLocation}
               onChange={(e) => setSearchLocation(e.target.value)}
               onKeyDown={handleKeyDown}
             />
          </div>

          <div className="hidden md:block w-[1px] h-8 bg-gray-200"></div>

          {/* Date Inputs (Visual only for MVP, or could implement date range picker later) */}
          <div className="hidden md:block flex-1 px-6 py-2 hover:bg-gray-50 cursor-pointer">
             <div className="text-xs font-bold uppercase tracking-wider text-gray-500 text-left">Check in</div>
             <div className="text-sm font-semibold text-gray-800 text-left text-gray-400">Add dates</div>
          </div>

          <div className="hidden md:block w-[1px] h-8 bg-gray-200"></div>

          <div className="hidden md:block flex-1 px-6 py-2 hover:bg-gray-50 cursor-pointer">
             <div className="text-xs font-bold uppercase tracking-wider text-gray-500 text-left">Check out</div>
             <div className="text-sm font-semibold text-gray-800 text-left text-gray-400">Add dates</div>
          </div>

          <div className="hidden md:block w-[1px] h-8 bg-gray-200"></div>

          {/* Guests Input */}
          <div className="flex-1 pl-6 pr-2 py-2 hover:bg-gray-50 rounded-full md:rounded-r-full cursor-pointer flex items-center justify-between">
             <div className="text-left w-full">
               <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Guests</div>
               <input
                 type="number"
                 min="1"
                 placeholder="Add guests"
                 className="w-full text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent"
                 value={guests}
                 onChange={(e) => setGuests(e.target.value)}
                 onKeyDown={handleKeyDown}
               />
             </div>
             <Button
               size="icon"
               className="rounded-full h-12 w-12 shrink-0 bg-primary hover:bg-primary/90 text-white shadow-md ml-2"
               onClick={handleSearch}
             >
                <Search className="w-5 h-5" />
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
