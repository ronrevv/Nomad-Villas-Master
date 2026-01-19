import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Search, 
  Menu, 
  User as UserIcon, 
  LogOut, 
  PlusCircle, 
  Briefcase, 
  Home, 
  Heart 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Simple Login Dialog
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [username, setUsername] = useState("");
  const { loginMutation } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    try {
      await loginMutation.mutateAsync({ username, password: "any" }); // Password ignored in mock
      onClose();
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${username}!`,
      });
    } catch (err) {
       toast({
        title: "Login failed",
        description: (err as Error).message,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log in or Sign up</DialogTitle>
          <DialogDescription>
            Enter your username to continue. We'll create an account if you don't have one.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleLogin}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Continue</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [showLogin, setShowLogin] = useState(false);

  // Determine where "Switch to hosting" should go
  // For MVP, if not logged in -> Login Modal
  // If logged in -> Host Dashboard (which will prompt to create if empty)
  // Actually, let's make it smarter:
  const handleHostingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowLogin(true);
    } else {
      window.location.href = "/host";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />

      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-padding h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-90 transition-opacity">
            {/* Simple logo icon */}
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
               <Home className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight hidden md:inline-block text-foreground">
              Nomad Villas
            </span>
          </Link>

          {/* Search Bar (Desktop) - simplified for layout, main search is on home */}
          {location !== "/" && (
            <div className="hidden md:flex items-center border rounded-full shadow-sm hover:shadow-md transition-all px-4 py-2.5 gap-4 cursor-pointer">
              <div className="text-sm font-medium pl-2">Anywhere</div>
              <div className="h-4 w-[1px] bg-border"></div>
              <div className="text-sm font-medium">Any week</div>
              <div className="h-4 w-[1px] bg-border"></div>
              <div className="text-sm text-muted-foreground pr-2 flex items-center gap-2">
                Add guests
                <div className="bg-primary p-1.5 rounded-full text-primary-foreground">
                  <Search className="w-3 h-3" />
                </div>
              </div>
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                className="hidden md:flex text-sm font-semibold rounded-full hover:bg-muted"
                onClick={handleHostingClick}
            >
              Switch to hosting
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-full px-2 py-1 h-10 border-muted-foreground/20 hover:shadow-md transition-all ml-1 gap-2">
                  <Menu className="w-4 h-4 ml-1" />
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={user?.profileImageUrl || ""} />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <UserIcon className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-border/50">
                {isAuthenticated ? (
                  <>
                    <DropdownMenuLabel>My Account ({user?.username})</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/trips">
                      <DropdownMenuItem className="cursor-pointer">
                        <Briefcase className="w-4 h-4 mr-2" />
                        Trips
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/wishlist">
                      <DropdownMenuItem className="cursor-pointer">
                        <Heart className="w-4 h-4 mr-2" />
                        Wishlist
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/host">
                      <DropdownMenuItem className="cursor-pointer">
                        <Home className="w-4 h-4 mr-2" />
                        Manage Listings
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive cursor-pointer"
                      onClick={() => logout.mutate()}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem 
                      className="font-semibold cursor-pointer"
                      onClick={() => setShowLogin(true)}
                    >
                      Sign up
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => setShowLogin(true)}
                    >
                      Log in
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => setShowLogin(true)}
                    >
                      Host your home
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur z-50 md:hidden pb-safe">
        <div className="flex justify-around items-center h-16">
          <Link href="/" className={`flex flex-col items-center gap-1 ${location === '/' || location === '/explore' ? 'text-primary' : 'text-muted-foreground'}`}>
            <Search className="w-6 h-6" />
            <span className="text-[10px] font-medium">Explore</span>
          </Link>
          <Link href="/wishlist" className={`flex flex-col items-center gap-1 ${location === '/wishlist' ? 'text-primary' : 'text-muted-foreground'}`}>
            <Heart className="w-6 h-6" />
            <span className="text-[10px] font-medium">Wishlist</span>
          </Link>
          <Link href="/trips" className={`flex flex-col items-center gap-1 ${location === '/trips' ? 'text-primary' : 'text-muted-foreground'}`}>
            <Briefcase className="w-6 h-6" />
            <span className="text-[10px] font-medium">Trips</span>
          </Link>
          <Link href="/host" className={`flex flex-col items-center gap-1 ${location === '/host' ? 'text-primary' : 'text-muted-foreground'}`}>
            <PlusCircle className="w-6 h-6" />
            <span className="text-[10px] font-medium">Host</span>
          </Link>
          <div 
            className={`flex flex-col items-center gap-1 ${location === '/profile' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => isAuthenticated ? null : setShowLogin(true)}
          >
            {isAuthenticated ? (
               <Avatar className="w-6 h-6">
                 <AvatarImage src={user?.profileImageUrl || ""} />
                 <AvatarFallback><UserIcon className="w-4 h-4" /></AvatarFallback>
               </Avatar>
            ) : (
              <UserIcon className="w-6 h-6" />
            )}
            <span className="text-[10px] font-medium">{isAuthenticated ? 'Profile' : 'Log in'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
