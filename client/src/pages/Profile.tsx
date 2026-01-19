import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

export default function Profile() {
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm({
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            username: user?.username || ""
        }
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/user", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update profile");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/user"] });
            toast({ title: "Profile updated" });
        },
        onError: (err) => {
            toast({ title: "Update failed", description: err.message, variant: "destructive" });
        }
    });

    if (!isAuthenticated) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <h2 className="text-2xl font-bold font-display">Log in to view your profile</h2>
                    <Button onClick={() => window.location.href = "/?login=true"}>Log In</Button>
                </div>
            </Layout>
        );
    }

    const onSubmit = (data: any) => {
        updateProfileMutation.mutate(data);
    };

    return (
        <Layout>
            <div className="container-padding py-10 max-w-2xl mx-auto">
                <h1 className="text-3xl font-display font-bold mb-8">Personal Info</h1>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>First Name</Label>
                            <Input {...form.register("firstName")} />
                        </div>
                        <div className="space-y-2">
                            <Label>Last Name</Label>
                            <Input {...form.register("lastName")} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input {...form.register("email")} type="email" />
                    </div>

                    <div className="space-y-2">
                        <Label>Username</Label>
                        <Input {...form.register("username")} disabled className="bg-muted" />
                        <p className="text-xs text-muted-foreground">Username cannot be changed.</p>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" disabled={updateProfileMutation.isPending}>
                            {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>

                <div className="mt-12 pt-8 border-t">
                    <h2 className="text-xl font-bold mb-4 text-destructive">Danger Zone</h2>
                    <Button variant="destructive" onClick={() => alert("Not implemented in MVP")}>
                        Deactivate Account
                    </Button>
                </div>
            </div>
        </Layout>
    );
}
