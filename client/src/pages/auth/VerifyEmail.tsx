import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Tasdiqlash tokeni topilmadi");
      return;
    }

    // Verify email
    fetch(`/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Gmail manzilingiz muvaffaqiyatli tasdiqlandi!");
          // Redirect to login after 3 seconds
          setTimeout(() => {
            setLocation("/auth/login");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "Tasdiqlashda xatolik yuz berdi");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Server bilan bog'lanishda xatolik yuz berdi");
      });
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 px-4 py-16">
      <Card className="w-full max-w-md shadow-xl border-primary/20">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center">
            {status === "loading" && <Loader2 className="h-12 w-12 text-primary animate-spin" />}
            {status === "success" && <CheckCircle2 className="h-12 w-12 text-green-500" />}
            {status === "error" && <XCircle className="h-12 w-12 text-red-500" />}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Tasdiqlanmoqda..."}
            {status === "success" && "Muvaffaqiyatli tasdiqlandi!"}
            {status === "error" && "Tasdiqlashda xatolik"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Gmail manzilingizni tasdiqlash jarayonida..."}
            {status === "success" && "Gmail manzilingiz muvaffaqiyatli tasdiqlandi!"}
            {status === "error" && "Gmail manzilingizni tasdiqlashda muammo yuz berdi"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert variant={status === "success" ? "default" : "destructive"}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === "success" && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Siz 3 soniyadan keyin login sahifasiga yo'naltirilasiz...
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/login">Hozir kirish</Link>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Agar sizga tasdiqlash emaili yuborilmagan bo'lsa yoki token muddati o'tgan bo'lsa, qayta yuborishni so'rashingiz mumkin.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/auth/login">Kirish sahifasiga qaytish</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/auth/register">Qayta ro'yxatdan o'tish</Link>
                </Button>
              </div>
            </div>
          )}

          {status === "loading" && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Iltimos, kuting...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

