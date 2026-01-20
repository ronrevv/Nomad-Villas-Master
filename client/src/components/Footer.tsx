import { Link } from "wouter";
import { Home, Facebook, Twitter, Instagram, Linkedin, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t mt-20">
      <div className="container-padding py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-90">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                   <Home className="w-5 h-5" />
                </div>
                <span className="font-display font-bold text-xl tracking-tight text-foreground">
                  Nomad Villas
                </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Find your perfect home away from home. Discover unique stays and experiences around the world.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Support</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">AirCover</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Anti-discrimination</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Disability support</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Cancellation options</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Hosting</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/host" className="hover:text-foreground transition-colors">Nomad your home</Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors">AirCover for Hosts</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Hosting resources</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Community forum</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Hosting responsibly</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Nomad Villas</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Newsroom</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">New features</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Investors</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Gift cards</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap gap-4 items-center">
            <span>© 2024 Nomad Villas, Inc.</span>
            <span className="hidden md:inline">·</span>
            <a href="#" className="hover:underline">Privacy</a>
            <span className="hidden md:inline">·</span>
            <a href="#" className="hover:underline">Terms</a>
            <span className="hidden md:inline">·</span>
            <a href="#" className="hover:underline">Sitemap</a>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 cursor-pointer hover:underline font-medium text-foreground">
                <Globe className="w-4 h-4" />
                <span>English (US)</span>
             </div>
             <div className="flex gap-4">
                <Facebook className="w-4 h-4 cursor-pointer hover:text-foreground transition-colors" />
                <Twitter className="w-4 h-4 cursor-pointer hover:text-foreground transition-colors" />
                <Instagram className="w-4 h-4 cursor-pointer hover:text-foreground transition-colors" />
                <Linkedin className="w-4 h-4 cursor-pointer hover:text-foreground transition-colors" />
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
