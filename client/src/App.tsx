import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import VillaDetails from "@/pages/VillaDetails";
import HostDashboard from "@/pages/HostDashboard";
import Trips from "@/pages/Trips";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/villas/:id" component={VillaDetails} />
      <Route path="/host" component={HostDashboard} />
      <Route path="/trips" component={Trips} />
      <Route path="/wishlist" component={Trips} /> {/* Reuse Trips page for now */}
      <Route path="/explore" component={Home} /> {/* Reuse Home for now */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
