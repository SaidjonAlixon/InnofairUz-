import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function UserLogin() {
  const { login, isLoading, error, user } = useAuth();
  const [, navigate] = useLocation();
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  if (user) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = credentials.email.trim().toLowerCase();
    if (!normalizedEmail.endsWith("@gmail.com")) {
      return alert("Faqat @gmail.com manzili orqali kirish mumkin.");
    }
    try {
      await login({ ...credentials, email: normalizedEmail });
      navigate("/");
    } catch (err) {
      // error handled via context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 px-4 py-16">
      <Card className="w-full max-w-md shadow-xl border-primary/20">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-2xl">Profilga kirish</CardTitle>
          <CardDescription>
            Fikr bildirish, investorlar bilan chatlashish va shaxsiy profilni boshqarish uchun tizimga kiring.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && !isLoading && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <Label htmlFor="login-email">Gmail manzili</Label>
              <Input
                id="login-email"
                type="email"
                value={credentials.email}
                placeholder="gmail manzilingiz"
                onChange={(event) => setCredentials((prev) => ({ ...prev, email: event.target.value }))}
                required
                title="Faqat @gmail.com bilan tugaydigan manzilni kiriting"
              />
            </div>
            <div>
              <Label htmlFor="login-password">Parol</Label>
              <Input
                id="login-password"
                type="password"
                value={credentials.password}
                onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Kirilmoqda..." : "Kirish"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground text-center">
            Hisobingiz yo'qmi? <Link href="/auth/register">Ro'yhatdan o'ting</Link>
          </p>
          <p className="mt-2 text-xs text-muted-foreground text-center">
            Administrator uchun <Link href="/admin/login">super admin paneliga kiring</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
