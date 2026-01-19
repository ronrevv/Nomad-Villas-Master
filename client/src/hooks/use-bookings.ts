import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertBooking, type Villa, type Booking } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useBookings() {
  return useQuery({
    queryKey: [api.bookings.list.path],
    queryFn: async () => {
      const res = await fetch(api.bookings.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return api.bookings.list.responses[200].parse(await res.json());
    },
  });
}

export function useTrips() {
    return useQuery({
        queryKey: [api.bookings.listExpanded.path],
        queryFn: async () => {
            const res = await fetch(api.bookings.listExpanded.path, { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch trips");
            return api.bookings.listExpanded.responses[200].parse(await res.json());
        }
    });
}

export function useHostBookings() {
    return useQuery({
        queryKey: [api.bookings.hostList.path],
        queryFn: async () => {
            const res = await fetch(api.bookings.hostList.path, { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch host bookings");
            return api.bookings.hostList.responses[200].parse(await res.json());
        }
    });
}

export function useUpdateBooking() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ id, status }: { id: number, status: "pending" | "confirmed" | "cancelled" | "completed" | "rejected" }) => {
            const url = api.bookings.update.path.replace(":id", id.toString());
            const res = await fetch(url, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
                credentials: "include"
            });
            if (!res.ok) throw new Error("Failed to update booking");
            return res.json();
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: [api.bookings.hostList.path] });
             queryClient.invalidateQueries({ queryKey: [api.bookings.listExpanded.path] });
             queryClient.invalidateQueries({ queryKey: [api.bookings.list.path] });
             toast({ title: "Booking updated" });
        },
        onError: (err) => {
             toast({ title: "Update failed", description: err.message, variant: "destructive" });
        }
    })
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertBooking) => {
      const res = await fetch(api.bookings.create.path, {
        method: api.bookings.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create booking");
      }
      return api.bookings.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bookings.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.bookings.listExpanded.path] });
      toast({
        title: "Booking Confirmed!",
        description: "Your trip has been booked successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
