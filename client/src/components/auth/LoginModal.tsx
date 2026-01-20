import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLoginModal } from "@/hooks/use-login-modal";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Shield, Home } from "lucide-react";

export function LoginModal() {
  const { isOpen, closeLogin } = useLoginModal();
  const { loginMutation } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    setIsLoading(true);
    try {
      await loginMutation.mutateAsync({ username, password: "any" });
      closeLogin();
      toast({
        title: "Welcome back!",
        description: `Logged in as ${username}`,
      });
    } catch (err) {
      toast({
        title: "Login failed",
        description: (err as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (role: "guest" | "host" | "admin") => {
    const userMap = {
      guest: "guestuser",
      host: "hostuser",
      admin: "admin"
    };
    const targetUsername = userMap[role];

    setIsLoading(true);
    try {
        await loginMutation.mutateAsync({ username: targetUsername, password: "any" });
        closeLogin();
        toast({
            title: `Logged in as ${role}`,
            description: "Welcome back!",
        });
    } catch (err) {
        toast({
            title: "Login failed",
            description: (err as Error).message,
            variant: "destructive"
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeLogin}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-bold text-center">Welcome to Nomad Villas</DialogTitle>
          <DialogDescription className="text-center">
             Log in to book your stay, manage listings, or administer the platform.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
            {/* Quick Login Section */}
            <div className="grid grid-cols-3 gap-2">
                <Button
                    variant="outline"
                    className="flex flex-col gap-2 h-auto py-3 hover:bg-primary/5 border-primary/20"
                    onClick={() => handleQuickLogin("guest")}
                    disabled={isLoading}
                >
                    <User className="w-5 h-5 text-primary" />
                    <span className="text-xs font-semibold">Guest</span>
                </Button>
                <Button
                    variant="outline"
                    className="flex flex-col gap-2 h-auto py-3 hover:bg-primary/5 border-primary/20"
                    onClick={() => handleQuickLogin("host")}
                    disabled={isLoading}
                >
                    <Home className="w-5 h-5 text-primary" />
                    <span className="text-xs font-semibold">Host</span>
                </Button>
                <Button
                    variant="outline"
                    className="flex flex-col gap-2 h-auto py-3 hover:bg-primary/5 border-primary/20"
                    onClick={() => handleQuickLogin("admin")}
                    disabled={isLoading}
                >
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="text-xs font-semibold">Admin</span>
                </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with username</span></div>
            </div>

            <form onSubmit={handleLogin} className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                        id="username"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoFocus
                        disabled={isLoading}
                    />
                </div>
                <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Continue"}
                </Button>
            </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
