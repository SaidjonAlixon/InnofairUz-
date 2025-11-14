import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

export default function AdminLogin() {
  const { login, user, isLoading, error } = useAuth();
  const [, navigate] = useLocation();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [submitted, setSubmitted] = useState(false);

  if (user?.role === "super_admin") {
    navigate("/admin");
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const normalizedEmail = credentials.email.trim().toLowerCase();
    if (!normalizedEmail.endsWith("@gmail.com")) {
      return alert("Faqat @gmail.com manzili orqali kirish mumkin.");
    }
    try {
      await login({ ...credentials, email: normalizedEmail });
      navigate("/admin");
    } catch (err) {
      // error already handled via context state
      console.error("Login failed", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 px-4 py-16">
      <Card className="w-full max-w-md shadow-xl border-primary/20">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Admin panelga kirish</CardTitle>
          <CardDescription>
            Super admin hisobiga kirib, inno-fair.uz platformasidagi kontent va foydalanuvchilarni boshqaring.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted && error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Kirish xatosi</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-left">
              <Label htmlFor="email">Gmail manzili</Label>
              <Input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(event) =>
                  setCredentials((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="Masalan: admin@gmail.com"
                required
                title="Faqat @gmail.com bilan tugaydigan manzilni kiriting"
                data-testid="input-admin-email"
              />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="password">Parol</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(event) =>
                  setCredentials((prev) => ({ ...prev, password: event.target.value }))
                }
                placeholder="Parolingiz"
                required
                data-testid="input-admin-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-admin-login">
              {isLoading ? "Kirilmoqda..." : "Kirish"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}



