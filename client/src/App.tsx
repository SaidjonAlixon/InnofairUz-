import { Switch, Route, useLocation } from "wouter";
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
import IdeasClub from "@/pages/IdeasClub";
import NotFound from "@/pages/not-found";
import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminRegister from "@/pages/admin/Register";
import UserLogin from "@/pages/auth/Login";
import UserRegister from "@/pages/auth/Register";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import Profile from "@/pages/Profile";
import { AuthProvider } from "@/context/AuthContext";

function AppRoutes() {
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
      <Route path="/yoshlar-klubi" component={IdeasClub} />
      <Route path="/auth/login" component={UserLogin} />
      <Route path="/auth/register" component={UserRegister} />
      <Route path="/auth/verify-email" component={VerifyEmail} />
      <Route path="/profile" component={Profile} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/register" component={AdminRegister} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/aloqa" component={Contact} />
      <Route path="/haqimizda" component={About} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && <Header />}
      <main className={`flex-1 ${isAdminRoute ? "bg-muted/20" : ""}`}>
        <AppRoutes />
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
