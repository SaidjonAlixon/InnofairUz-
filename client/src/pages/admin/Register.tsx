import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
export default function AdminRegister() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 px-4 py-16">
      <Card className="w-full max-w-md shadow-xl border-primary/20">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-2xl">Ro'yxatdan o'tish (Admin)</CardTitle>
          <CardDescription>
            Hozircha adminlar faqat super admin tomonidan qo'shiladi. Agar siz admin bo'lishni xohlasangiz, tizim
            boshqaruvchisiga murojaat qiling.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              Yaqin orada adminlar uchun mustaqil ro'yxatdan o'tish imkoniyati yo'lga qo'yiladi.
            </AlertDescription>
          </Alert>
          <Button className="w-full" onClick={() => (window.location.href = "/admin/login")}>Kirish sahifasiga qaytish</Button>
        </CardContent>
      </Card>
    </div>
  );
}
