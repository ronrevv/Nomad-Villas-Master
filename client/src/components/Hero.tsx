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
    <div className="relative w-full h-[550px] md:h-[650px] flex items-center justify-center bg-gray-100 overflow-hidden">
      {/* Background Image - Lighter & More Professional */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600596542815-6ad4c727dd2d?q=80&w=2070&auto=format&fit=crop"
          alt="Hero Background"
          className="w-full h-full object-cover"
        />
        {/* Lighter overlay for better text contrast without being too dark */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:hidden" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-white drop-shadow-lg mb-6 leading-tight">
          Find your next <span className="text-white/90">adventure</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-white font-medium drop-shadow-md max-w-2xl mx-auto mb-10 hidden md:block">
          Discover luxury villas, cozy cabins, and unique stays around the world.
        </p>

        {/* Search Bar Container */}
        <div className="w-full max-w-3xl bg-white rounded-3xl md:rounded-full shadow-2xl p-4 md:p-2">

          {/* Mobile Layout (Vertical) */}
          <div className="flex flex-col gap-4 md:hidden">
            <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Where</label>
              <input
                type="text"
                placeholder="Search destinations"
                className="w-full bg-transparent font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="flex gap-4">
              <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 flex-1">
                 <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Dates</label>
                 <div className="text-sm font-semibold text-gray-400">Add dates</div>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 flex-1">
                 <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Guests</label>
                 <input
                    type="number"
                    min="1"
                    placeholder="Add guests"
                    className="w-full bg-transparent font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
              </div>
            </div>

            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-lg h-12 rounded-xl shadow-md mt-2"
              onClick={handleSearch}
            >
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>

          {/* Desktop Layout (Horizontal Pill) */}
          <div className="hidden md:flex flex-row items-center divide-x divide-gray-200">
            {/* Location */}
            <div className="flex-[1.5] px-8 py-3 hover:bg-gray-50 rounded-l-full cursor-pointer transition-colors relative group">
               <div className="text-xs font-bold uppercase tracking-wider text-gray-500 text-left mb-0.5">Location</div>
               <input
                 type="text"
                 placeholder="Where are you going?"
                 className="w-full text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent truncate"
                 value={searchLocation}
                 onChange={(e) => setSearchLocation(e.target.value)}
                 onKeyDown={handleKeyDown}
               />
            </div>

            {/* Check in */}
            <div className="flex-1 px-8 py-3 hover:bg-gray-50 cursor-pointer transition-colors text-left">
               <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-0.5">Check in</div>
               <div className="text-sm font-semibold text-gray-400">Add dates</div>
            </div>

            {/* Check out */}
            <div className="flex-1 px-8 py-3 hover:bg-gray-50 cursor-pointer transition-colors text-left">
               <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-0.5">Check out</div>
               <div className="text-sm font-semibold text-gray-400">Add dates</div>
            </div>

            {/* Guests */}
            <div className="flex-1 pl-8 pr-2 py-2 hover:bg-gray-50 rounded-r-full cursor-pointer transition-colors flex items-center justify-between">
               <div className="text-left">
                 <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-0.5">Guests</div>
                 <input
                   type="number"
                   min="1"
                   placeholder="Add guests"
                   className="w-full text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent"
                   value={guests}
                   onChange={(e) => setGuests(e.target.value)}
                   onKeyDown={handleKeyDown}
                 />
               </div>
               <Button
                 size="icon"
                 className="rounded-full h-12 w-12 shrink-0 bg-primary hover:bg-primary/90 text-white shadow-lg ml-4 transition-transform hover:scale-105 active:scale-95"
                 onClick={handleSearch}
               >
                  <Search className="w-5 h-5" />
               </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
