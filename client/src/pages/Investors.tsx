import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Handshake, LineChart } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

const investorSegments = [
  {
    title: "Venchur fondlari",
    description: "Yuqori o'sish salohiyatiga ega startaplar va ilmiy loyihalar uchun 200 ming - 1 mln USD oralig'idagi investitsiya paketlari.",
    focus: ["Sun'iy intellekt", "Yashil energetika", "BioTexnologiya"],
  },
  {
    title: "Sanoat hamkorlari",
    description: "Sanoat korxonalari bilan qo'shma ishlab chiqarish va texnologiya transferi uchun hamkorlik yo'nalishlari.",
    focus: ["Agrotexnika", "Qishloq xo'jaligi", "Qurilish materiallari"],
  },
  {
    title: "Xalqaro grantlar",
    description: "Innovatsion g'oyalarni inkubatsiya va prototiplash uchun grant dasturlari va akseleratorlar ro'yxati.",
    focus: ["Erasmus+", "UNDP", "Tech4Good"],
  },
];

const partnershipSteps = [
  "G'oya yoki loyiha pasportini yuborish",
  "Ekspert komissiyasi tomonidan baholash",
  "Investorlar bilan uchrashuv va kelishuvlar",
  "Pilot loyihani boshlash va monitoring",
];

export default function InvestorsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [messages, setMessages] = useState(() => [
    {
      id: 1,
      author: "Investor",
      text: "Assalomu alaykum! Bizga energiya tejamkor yechimlaringiz haqida ma'lumot qoldiring.",
      timestamp: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
      isInvestor: true,
    },
  ]);
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (!user) {
      toast({
        title: "Kirish talab qilinadi",
        description: "Investorlar bilan yozishish uchun tizimga kiring.",
        variant: "destructive",
      });
      navigate("/auth/login");
      return;
    }

    const trimmed = message.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        author: user.fullName,
        text: trimmed,
        timestamp: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
        isInvestor: false,
        avatar: user.avatar,
      },
      {
        id: prev.length + 2,
        author: "Investor",
        text: "Rahmat! Bizning ekspertlar jamoamiz siz bilan tez orada bog'lanadi.",
        timestamp: new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
        isInvestor: true,
      },
    ]);
    setMessage("");
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-10">
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <Badge variant="outline" className="mx-auto w-fit px-4 py-1 text-sm">
            inno-fair.uz Investorlar maydoni
          </Badge>
          <h1 className="text-4xl font-bold">Investorlar va sheriklar uchun takliflar</h1>
          <p className="text-lg text-muted-foreground">
            Mintaqaviy innovatsion yarmarka doirasida tasdiqlangan loyihalar uchun moliyalashtirish, hamkorlik va qo'shma ishlab chiqarish imkoniyatlari.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {investorSegments.map((segment) => (
            <Card key={segment.title} className="hover-elevate active-elevate-2">
              <CardHeader>
                <CardTitle>{segment.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{segment.description}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <h4 className="font-semibold text-sm uppercase text-muted-foreground">Ustuvor yo'nalishlar</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {segment.focus.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-primary" />
                Investitsiya paketlari
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                РІР‚Сћ Innovatsion g'oyalar uchun: 50 000 - 100 000 USD gacha bo'lgan kichik grant va qisqa muddatli akseleratsiya dasturlari.
              </p>
              <p>
                РІР‚Сћ Mahsulot prototiplari uchun: 150 000 - 300 000 USD oralig'ida qo'shma investitsiya va laboratoriya infratuzilmasi.
              </p>
              <p>
                РІР‚Сћ Sanoat darajasidagi yechimlar uchun: 500 000 USD dan boshlab venture debt va strategik sheriklik bitimlari.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Hamkor korxonalar tarmog'i
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>РІР‚Сћ Mahalliy ishlab chiqaruvchilar va texnoparklar bilan qo'shma ishlab chiqarish.</p>
              <p>РІР‚Сћ Universitetlar va ilmiy markazlar bilan ilmiy-tadqiqot hamkorligi.</p>
              <p>РІР‚Сћ Bank va moliya institutlari bilan lizing va kredit liniyalari bo'yicha kelishuvlar.</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Investorlar bilan chat</CardTitle>
            <p className="text-sm text-muted-foreground">
              Investorlar va ishtirokchilar o'zaro fikr almashishi, uchrashuvlarni rejalashtirishi va savollar berishi mumkin.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-lg bg-muted/30 p-4 max-h-96 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isInvestor ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-3 shadow-sm ${
                      message.isInvestor ? "bg-primary text-primary-foreground" : "bg-background border"
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1 opacity-80">
                      {message.author}
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                    <div className="text-[10px] opacity-70 mt-2 text-right">{message.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>

            {user ? (
              <div className="space-y-2">
                <Textarea
                  placeholder="Savolingiz yoki taklifingizni yozing..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px]"
                  data-testid="textarea-user-message"
                />
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{user.fullName} sifatida yozmoqdasiz</span>
                </div>
                <Button
                  onClick={handleSendMessage}
                  className="w-full md:w-auto"
                  disabled={!message.trim()}
                  data-testid="button-send-message"
                >
                  Xabar yuborish
                </Button>
              </div>
            ) : (
              <Card className="border-dashed border-primary/40 bg-card/40">
                <CardContent className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                  <p className="text-muted-foreground text-center sm:text-left">
                    Investorlar bilan chatlashish uchun tizimga kiring yoki ro'yxatdan o'ting.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => navigate("/auth/login")}>Kirish</Button>
                    <Button variant="outline" onClick={() => navigate("/auth/register")}>
                      Ro'yxatdan o'tish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Handshake className="h-5 w-5 text-primary" />
              Hamkorlik jarayoni
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {partnershipSteps.map((step, index) => (
                <div key={step} className="border rounded-lg p-4">
                  <Badge variant="secondary" className="mb-2">{index + 1}-bosqich</Badge>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground max-w-2xl">
                Hamkorlik imkoniyatlari haqida batafsil ma'lumot olish uchun loyiha pasportini va qisqacha pitch presentation faylini yuboring.
              </p>
              <Button size="lg" data-testid="button-investor-apply">
                Hamkorlikni boshlash
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




