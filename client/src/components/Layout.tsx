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

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [location] = useLocation();

  const isHost = true; // Simplified for MVP

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-padding h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-90 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M19.006 3.705a.75.75 0 0 0-.512-1.41L6 6.838V2.25a.75.75 0 0 0-.75-.75h-1.5A.75.75 0 0 0 3 2.25v6.204c-1.14.945-1.579 2.528-1.5 3.998.077 1.446.735 2.822 1.95 3.754V21a.75.75 0 0 0 .75.75h3.75a.75.75 0 0 0 .75-.75v-4.5h2.25v4.5a.75.75 0 0 0 .75.75h3.75a.75.75 0 0 0 .75-.75v-1.636a6.002 6.002 0 0 0 3.75-9.284ZM6 19.5h-1.5v-2.25H6v2.25Zm1.5-3v-2.25h1.5v2.25h-1.5Zm3.75-5.25a3.75 3.75 0 0 1-1.683-6.852l12.42 2.76a3.752 3.752 0 0 1 1.763 6.643V13.5h-12.5v-2.25Z" />
            </svg>
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
            <Link href="/host">
              <Button variant="ghost" className="hidden md:flex text-sm font-semibold rounded-full hover:bg-muted">
                Switch to hosting
              </Button>
            </Link>
            
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
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
                      onClick={() => logout()}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem 
                      className="font-semibold cursor-pointer"
                      onClick={() => window.location.href = "/api/login"}
                    >
                      Sign up
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => window.location.href = "/api/login"}
                    >
                      Log in
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => window.location.href = "/api/login"}
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
            onClick={() => isAuthenticated ? null : (window.location.href = "/api/login")}
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
