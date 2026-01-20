import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLoginModal } from "@/hooks/use-login-modal";
import { LoginModal } from "@/components/auth/LoginModal";
import { 
  Search, 
  Menu, 
  User as UserIcon, 
  LogOut, 
  PlusCircle, 
  Briefcase, 
  Home, 
  Heart,
  MessageSquare
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
import { useEffect } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const { openLogin } = useLoginModal();
  const [location, setLocation] = useLocation();

  useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("login") === "true" && !isAuthenticated) {
          openLogin();
          // Clean up URL
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
      }
  }, [isAuthenticated, openLogin]);

  const handleHostingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openLogin();
    } else {
      window.location.href = "/host";
    }
  };

  const isHostOrAdmin = user?.role === "host" || user?.role === "admin";
  // Show if not logged in (to prompt login) OR if host/admin
  const showHostingOptions = !isAuthenticated || isHostOrAdmin;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <LoginModal />

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
            <div className="hidden md:flex items-center border rounded-full shadow-sm hover:shadow-md transition-all px-4 py-2.5 gap-4 cursor-pointer" onClick={() => setLocation('/')}>
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
            {showHostingOptions && (
              <Button
                  variant="ghost"
                  className="hidden md:flex text-sm font-semibold rounded-full hover:bg-muted"
                  onClick={handleHostingClick}
              >
                Switch to hosting
              </Button>
            )}
            
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
                    <Link href="/inbox">
                      <DropdownMenuItem className="cursor-pointer">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Messages
                      </DropdownMenuItem>
                    </Link>
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
                    <Link href="/profile">
                        <DropdownMenuItem className="cursor-pointer">
                            <UserIcon className="w-4 h-4 mr-2" />
                            Profile
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    {isHostOrAdmin && (
                      <Link href="/host">
                        <DropdownMenuItem className="cursor-pointer">
                          <Home className="w-4 h-4 mr-2" />
                          Manage Listings
                        </DropdownMenuItem>
                      </Link>
                    )}
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
                      onClick={() => openLogin()}
                    >
                      Sign up
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => openLogin()}
                    >
                      Log in
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => openLogin()}
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
          <Link href="/inbox" className={`flex flex-col items-center gap-1 ${location === '/inbox' ? 'text-primary' : 'text-muted-foreground'}`}>
            <MessageSquare className="w-6 h-6" />
            <span className="text-[10px] font-medium">Inbox</span>
          </Link>
          <div 
            className={`flex flex-col items-center gap-1 ${location === '/profile' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => isAuthenticated ? setLocation('/profile') : openLogin()}
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
