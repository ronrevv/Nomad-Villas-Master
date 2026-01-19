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
import BecomeHost from "@/pages/BecomeHost";
import Wishlist from "@/pages/Wishlist";
import Inbox from "@/pages/Inbox";
import Profile from "@/pages/Profile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/villas/:id" component={VillaDetails} />
      <Route path="/host" component={HostDashboard} />
      <Route path="/become-a-host" component={BecomeHost} />
      <Route path="/trips" component={Trips} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/inbox" component={Inbox} />
      <Route path="/profile" component={Profile} />
      <Route path="/explore" component={Home} />
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
