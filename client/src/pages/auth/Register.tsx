import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function UserRegister() {
  const { register, isLoading, error, user } = useAuth();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({
    username: "",
    password: "",
    fullName: "",
    avatar: "",
  });

  if (user) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      // context handles error
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 px-4 py-16">
      <Card className="w-full max-w-md shadow-xl border-primary/20">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-2xl">Yangi profil yaratish</CardTitle>
          <CardDescription>
            Izoh yozish, investorlar bilan chatlashish hamda shaxsiy profilingizni boshqarish uchun ro'yxatdan o'ting.
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
              <Label htmlFor="register-fullname">To'liq ism</Label>
              <Input
                id="register-fullname"
                value={form.fullName}
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="register-username">Foydalanuvchi nomi</Label>
              <Input
                id="register-username"
                value={form.username}
                onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="register-password">Parol</Label>
              <Input
                id="register-password"
                type="password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="register-avatar">Profil rasmi (ixtiyoriy, URL)</Label>
              <Input
                id="register-avatar"
                value={form.avatar}
                onChange={(event) => setForm((prev) => ({ ...prev, avatar: event.target.value }))}
                placeholder="https://..."
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Yaratilmoqda..." : "Ro'yxatdan o'tish"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground text-center">
            Allaqachon hisobingiz bormi? <Link href="/auth/login">Kirish</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
