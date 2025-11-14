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
    email: "",
    password: "",
    fullName: "",
    role: "" as "" | "investor" | "mijoz",
  });

  if (user) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = form.email.trim().toLowerCase();
    if (!normalizedEmail.endsWith("@gmail.com")) {
      return alert("Faqat @gmail.com manzillari orqali ro'yxatdan o'tish mumkin.");
    }
    if (!form.role) {
      return alert("Rolni tanlang: Investor yoki Mijoz.");
    }
    try {
      await register({ ...form, email: normalizedEmail, role: form.role });
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
              <Label htmlFor="register-email">Gmail manzili</Label>
              <Input
                id="register-email"
                type="email"
                value={form.email}
                placeholder="misol: foydalanuvchi@gmail.com"
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value.toLowerCase() }))}
                required
                title="Faqat @gmail.com bilan tugaydigan manzilni kiriting"
              />
              <p className="text-xs text-muted-foreground mt-1">Faqat Gmail ( @gmail.com ) orqali ro'yxatdan o'tish mumkin.</p>
            </div>
            <div>
              <Label htmlFor="register-role">Rolingiz</Label>
              <select
                id="register-role"
                value={form.role}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, role: event.target.value as "investor" | "mijoz" }))
                }
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="" disabled>
                  Rolni tanlang
                </option>
                <option value="investor">Investor</option>
                <option value="mijoz">Mijoz</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">Investor yoki mijoz rolini tanlang.</p>
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
