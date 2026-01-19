import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertVilla } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useVillas(filters?: { location?: string; minPrice?: number; maxPrice?: number; guests?: number }) {
  return useQuery({
    queryKey: [api.villas.list.path, filters],
    queryFn: async () => {
      // Build query string manually since buildUrl is for path params
      const params = new URLSearchParams();
      if (filters?.location) params.append("location", filters.location);
      if (filters?.minPrice) params.append("minPrice", filters.minPrice.toString());
      if (filters?.maxPrice) params.append("maxPrice", filters.maxPrice.toString());
      if (filters?.guests) params.append("guests", filters.guests.toString());
      
      const url = `${api.villas.list.path}?${params.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch villas");
      return api.villas.list.responses[200].parse(await res.json());
    },
  });
}

export function useVilla(id: number) {
  return useQuery({
    queryKey: [api.villas.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.villas.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch villa");
      return api.villas.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateVilla() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertVilla) => {
      const res = await fetch(api.villas.create.path, {
        method: api.villas.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create villa");
      }
      return api.villas.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.villas.list.path] });
      toast({
        title: "Success",
        description: "Your villa has been listed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useFavorites() {
    return useQuery({
        queryKey: [api.favorites.list.path],
        queryFn: async () => {
            const res = await fetch(api.favorites.list.path, { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch favorites");
            return api.favorites.list.responses[200].parse(await res.json());
        }
    });
}

export function useToggleFavorite() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (villaId: number) => {
            const res = await fetch(api.favorites.toggle.path, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ villaId }),
                credentials: "include"
            });
            if (!res.ok) throw new Error("Failed to toggle favorite");
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [api.favorites.list.path] });
            toast({ title: data.favorited ? "Saved to wishlist" : "Removed from wishlist" });
        },
        onError: (err) => {
            toast({ title: "Action failed", description: err.message, variant: "destructive" });
        }
    });
}
