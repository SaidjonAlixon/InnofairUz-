import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import ArticleDetail from "@/pages/ArticleDetail";
import Contact from "@/pages/Contact";
import About from "@/pages/About";
import Articles from "@/pages/Articles";
import Events from "@/pages/Events";
import Investors from "@/pages/Investors";
import Media from "@/pages/Media";
import Products from "@/pages/Products";
import Solutions from "@/pages/Solutions";
import Collaboration from "@/pages/Ideas";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/maqola/:id" component={ArticleDetail} />
      <Route path="/yangilik/:id" component={ArticleDetail} />
      <Route path="/goya/:id" component={ArticleDetail} />
      <Route path="/tadbirlar" component={Events} />
      <Route path="/loyihalar" component={Articles} />
      <Route path="/investorlar" component={Investors} />
      <Route path="/media" component={Media} />
      <Route path="/mahsulotlar" component={Products} />
      <Route path="/yechimlar" component={Solutions} />
      <Route path="/hamkorlik" component={Collaboration} />
      <Route path="/aloqa" component={Contact} />
      <Route path="/haqimizda" component={About} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
