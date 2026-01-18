import { useState } from "react";
import { addDays, differenceInDays, format } from "date-fns";
import { Villa } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useCreateBooking } from "@/hooks/use-bookings";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookingWidgetProps {
  villa: Villa;
}

export function BookingWidget({ villa }: BookingWidgetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const createBooking = useCreateBooking();
  
  const [date, setDate] = useState<{ from: Date; to: Date } | undefined>();
  const [guests, setGuests] = useState("1");

  const numberOfNights = date?.from && date?.to 
    ? differenceInDays(date.to, date.from) 
    : 0;
  
  const cleaningFee = 50;
  const serviceFee = Math.round(villa.pricePerNight * numberOfNights * 0.12);
  const total = (villa.pricePerNight * numberOfNights) + cleaningFee + serviceFee;

  const handleReserve = () => {
    if (!user) {
      window.location.href = "/api/login";
      return;
    }

    if (!date?.from || !date?.to) {
      toast({
        title: "Dates required",
        description: "Please select check-in and check-out dates.",
        variant: "destructive"
      });
      return;
    }

    createBooking.mutate({
      villaId: villa.id,
      guestId: user.id, // Replit auth ID is string
      startDate: format(date.from, "yyyy-MM-dd"),
      endDate: format(date.to, "yyyy-MM-dd"),
      guestCount: parseInt(guests),
      totalPrice: total,
    });
  };

  return (
    <div className="p-6 border rounded-2xl shadow-xl shadow-black/5 bg-card sticky top-24">
      <div className="flex justify-between items-end mb-6">
        <div>
          <span className="text-2xl font-bold font-display">${villa.pricePerNight}</span>
          <span className="text-muted-foreground ml-1">night</span>
        </div>
        <div className="text-sm font-medium underline cursor-pointer">
          {villa.reviewCount} reviews
        </div>
      </div>

      <div className="border rounded-xl mb-4 overflow-hidden">
        <div className="grid grid-cols-2 border-b">
          <div className="p-3 border-r hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="text-[10px] font-bold uppercase text-muted-foreground">Check-in</div>
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-sm font-medium w-full text-left truncate">
                  {date?.from ? format(date.from, "MMM d, yyyy") : "Add date"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={(range: any) => setDate(range)}
                  numberOfMonths={2}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="p-3 hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="text-[10px] font-bold uppercase text-muted-foreground">Check-out</div>
            <div className="text-sm font-medium truncate">
               {date?.to ? format(date.to, "MMM d, yyyy") : "Add date"}
            </div>
          </div>
        </div>
        <div className="p-3 hover:bg-muted/50 transition-colors">
          <div className="text-[10px] font-bold uppercase text-muted-foreground">Guests</div>
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger className="h-auto p-0 border-0 focus:ring-0 text-sm font-medium bg-transparent">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[...Array(villa.maxGuests)].map((_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {i + 1} guest{i > 0 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        size="lg" 
        className="w-full text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
        onClick={handleReserve}
        disabled={createBooking.isPending}
      >
        {createBooking.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Reserving...
          </>
        ) : (
          "Reserve"
        )}
      </Button>

      {numberOfNights > 0 && (
        <div className="mt-6 space-y-4">
          <div className="text-center text-sm text-muted-foreground">You won't be charged yet</div>
          <div className="space-y-3 pt-2">
            <div className="flex justify-between text-muted-foreground">
              <span className="underline">${villa.pricePerNight} x {numberOfNights} nights</span>
              <span>${villa.pricePerNight * numberOfNights}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span className="underline">Cleaning fee</span>
              <span>${cleaningFee}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span className="underline">Service fee</span>
              <span>${serviceFee}</span>
            </div>
          </div>
          <div className="flex justify-between font-bold border-t pt-4 text-lg">
            <span>Total before taxes</span>
            <span>${total}</span>
          </div>
        </div>
      )}
    </div>
  );
}
