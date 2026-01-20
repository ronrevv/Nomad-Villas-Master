import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function Hero() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);

  // Initialize state from URL params
  const [searchLocation, setSearchLocation] = useState(searchParams.get("location") || "");
  const [guests, setGuests] = useState(searchParams.get("guests") || "");
  const [date, setDate] = useState<{ from: Date | undefined; to: Date | undefined } | undefined>(
    searchParams.get("from") && searchParams.get("to")
      ? {
          from: new Date(searchParams.get("from")!),
          to: new Date(searchParams.get("to")!),
        }
      : undefined
  );

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation) params.append("location", searchLocation);
    if (guests) params.append("guests", guests);
    if (date?.from) params.append("from", date.from.toISOString());
    if (date?.to) params.append("to", date.to.toISOString());

    setLocation(`/?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="relative w-full h-[550px] md:h-[650px] flex items-center justify-center bg-gray-100 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop"
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
               {/* Mobile Date Picker (Simple Input for now or reduced Popover) */}
               {/* Using Popover for consistency but adapting trigger */}
              <Popover>
                <PopoverTrigger asChild>
                    <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 flex-1 cursor-pointer">
                        <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Dates</label>
                        <div className={cn("text-sm font-semibold", !date?.from && "text-gray-400")}>
                            {date?.from ? (
                                date.to ? (
                                    <>{format(date.from, "MMM d")} - {format(date.to, "MMM d")}</>
                                ) : (
                                    format(date.from, "MMM d")
                                )
                            ) : (
                                "Add dates"
                            )}
                        </div>
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={1}
                    />
                </PopoverContent>
              </Popover>

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

            {/* Date Range Picker Popover */}
            <Popover>
                <PopoverTrigger asChild>
                    <div className="flex-[2] flex cursor-pointer hover:bg-gray-50 transition-colors">
                        {/* Check in */}
                        <div className="flex-1 px-6 py-3 text-left border-r border-transparent">
                           <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-0.5">Check in</div>
                           <div className={cn("text-sm font-semibold truncate", !date?.from && "text-gray-400")}>
                                {date?.from ? format(date.from, "MMM d") : "Add dates"}
                           </div>
                        </div>

                        {/* Check out */}
                        <div className="flex-1 px-6 py-3 text-left">
                           <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-0.5">Check out</div>
                           <div className={cn("text-sm font-semibold truncate", !date?.to && "text-gray-400")}>
                                {date?.to ? format(date.to, "MMM d") : "Add dates"}
                           </div>
                        </div>
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>

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
