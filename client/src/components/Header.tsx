import { Link, useLocation } from "wouter";
import { Search, Menu, X, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { id: "home", name: "Bosh sahifa", path: "/" },
  { id: "events", name: "Tadbirlar taqvimi", path: "/tadbirlar" },
  { id: "projects", name: "Loyihalar va g'oyalar", path: "/loyihalar" },
  { id: "investors", name: "Investorlar va sheriklar", path: "/investorlar" },
  { id: "media", name: "Media markaz", path: "/media" },
  { id: "products", name: "Tijorat mahsulotlari", path: "/mahsulotlar" },
  { id: "solutions", name: "Hududiy yechimlar", path: "/yechimlar" },
  { id: "ideas-club", name: "G'oyalar klubi", path: "/goyalar-klubi" },
  { id: "collab", name: "Hamkorlik va fikrlar", path: "/hamkorlik" },
];

export default function Header() {
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogin = () => {
    navigate("/auth/login");
    setMobileMenuOpen(false);
  };

  const handleRegister = () => {
    navigate("/auth/register");
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-3 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-blue-500 to-blue-600 text-white shadow-sm">
                <Lightbulb className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">inno-fair.uz</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-0">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path} data-testid={`link-${item.id}`}>
                <Button
                  variant={location === item.path ? "secondary" : "ghost"}
                  className="font-medium leading-tight whitespace-normal text-center h-auto min-h-[44px] w-[120px] px-2.5 py-2"
                >
                  {item.id === "media" ? (
                    <>
                      Media<br />markaz
                    </>
                  ) : item.id === "ideas-club" ? (
                    <>
                      G'oyalar<br />klubi
                    </>
                  ) : (
                    item.name
                  )}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 pe-2 sm:pe-4">
            {searchOpen ? (
              <div className="flex items-center gap-2">
                <Input
                  type="search"
                  placeholder="Qidirish..."
                  className="w-48 lg:w-64"
                  data-testid="input-search"
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setSearchOpen(false)}
                  data-testid="button-close-search"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSearchOpen(true)}
                data-testid="button-open-search"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}
            
            <ThemeToggle />

            {!user && (
              <>
                <Button variant="default" onClick={handleLogin} data-testid="button-user-login">
                  Kirish
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRegister}
                  data-testid="button-user-register"
                  className="hidden lg:inline-flex"
                >
                  Ro'yhatdan o'tish
                </Button>
              </>
            )}

            {user && (
              <div className="hidden lg:flex items-center gap-3 pl-3">
                <Link href="/profile" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="text-right">
                    <p className="text-sm font-semibold leading-tight">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground lowercase">{user.email}</p>
                  </div>
                  <Avatar className="h-9 w-9">
                    {user.avatar ? <AvatarImage src={user.avatar} /> : null}
                    <AvatarFallback>{user.fullName?.[0] ?? "U"}</AvatarFallback>
                  </Avatar>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout} data-testid="button-user-logout">
                  Chiqish
                </Button>
              </div>
            )}

            <Button
              size="icon"
              variant="ghost"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden border-t py-4 space-y-2">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={location === item.path ? "secondary" : "ghost"}
                  className="w-full justify-start font-medium leading-tight whitespace-normal text-left h-auto min-h-[44px] py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.id === "media" ? (
                    <>
                      Media<br />markaz
                    </>
                  ) : item.id === "ideas-club" ? (
                    <>
                      G'oyalar<br />klubi
                    </>
                  ) : (
                    item.name
                  )}
                </Button>
              </Link>
            ))}
            {!user ? (
              <>
                <Button className="w-full" onClick={handleLogin}>
                  Kirish
                </Button>
                <Button variant="outline" className="w-full" onClick={handleRegister}>
                  Ro'yhatdan o'tish
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2 w-full border-t pt-4 mt-2">
                <Link href="/profile" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                  <Avatar className="h-8 w-8">
                    {user.avatar ? <AvatarImage src={user.avatar} /> : null}
                    <AvatarFallback>{user.fullName?.[0] ?? "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground lowercase">{user.email}</p>
                  </div>
                </Link>
                <Button variant="outline" onClick={() => logout()} data-testid="button-user-logout-mobile">
                  Chiqish
                </Button>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}



