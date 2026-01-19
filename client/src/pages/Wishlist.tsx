import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { VillaCard } from "@/components/VillaCard";
import { Villa } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function Wishlist() {
    const { isAuthenticated } = useAuth();
    const { data: favorites, isLoading } = useQuery<Villa[]>({
        queryKey: [api.favorites.list.path],
        queryFn: async () => {
            const res = await fetch(api.favorites.list.path, { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch favorites");
            return res.json();
        },
        enabled: isAuthenticated
    });

    if (!isAuthenticated) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <h2 className="text-2xl font-bold font-display">Log in to view your wishlist</h2>
                    <Button onClick={() => window.location.href = "/?login=true"}>Log In</Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container-padding py-10">
                <h1 className="text-3xl font-display font-bold mb-8">Wishlist</h1>
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : favorites && favorites.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                        {favorites.map(villa => (
                            <VillaCard key={villa.id} villa={villa} />
                        ))}
                    </div>
                ) : (
                    <div className="py-12 border-t text-center">
                        <h2 className="text-2xl font-bold mb-2">No saves yet</h2>
                        <p className="text-muted-foreground mb-6">As you search, click the heart icon to save your favorite places.</p>
                        <Link href="/">
                            <Button size="lg" className="font-semibold">Start exploring</Button>
                        </Link>
                    </div>
                )}
            </div>
        </Layout>
    );
}
