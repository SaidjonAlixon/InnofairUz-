import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Handshake, LineChart } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

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

type ChatRole = "investor" | "participant";

interface ChatMessage {
  id: number;
  role: ChatRole;
  text: string;
  timestamp: string;
}

const roleLabels: Record<ChatRole, string> = {
  investor: "Investor",
  participant: "Ishtirokchi",
};

const getTimestamp = () =>
  new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });

export default function InvestorsPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 1,
      role: "investor",
      text: "Assalomu alaykum! Bizga energiya tejamkor yechimlaringiz haqida ma'lumot qoldiring.",
      timestamp: getTimestamp(),
    },
    {
      id: 2,
      role: "participant",
      text: "Salom! Quyosh panellari monitoring tizimini taklif etamiz, prototip tayyor.",
      timestamp: getTimestamp(),
    },
  ]);
  const [investorMessage, setInvestorMessage] = useState("");
  const [participantMessage, setParticipantMessage] = useState("");

  const sendMessage = (role: ChatRole, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        role,
        text: trimmed,
        timestamp: getTimestamp(),
      },
    ]);
  };

  const handleInvestorSend = () => {
    sendMessage("investor", investorMessage);
    setInvestorMessage("");
  };

  const handleParticipantSend = () => {
    sendMessage("participant", participantMessage);
    setParticipantMessage("");
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-10">
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <Badge variant="outline" className="mx-auto w-fit px-4 py-1 text-sm">
            InnofairUz Investorlar maydoni
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
                • Innovatsion g'oyalar uchun: 50 000 - 100 000 USD gacha bo'lgan kichik grant va qisqa muddatli akseleratsiya dasturlari.
              </p>
              <p>
                • Mahsulot prototiplari uchun: 150 000 - 300 000 USD oralig'ida qo'shma investitsiya va laboratoriya infratuzilmasi.
              </p>
              <p>
                • Sanoat darajasidagi yechimlar uchun: 500 000 USD dan boshlab venture debt va strategik sheriklik bitimlari.
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
              <p>• Mahalliy ishlab chiqaruvchilar va texnoparklar bilan qo'shma ishlab chiqarish.</p>
              <p>• Universitetlar va ilmiy markazlar bilan ilmiy-tadqiqot hamkorligi.</p>
              <p>• Bank va moliya institutlari bilan lizing va kredit liniyalari bo'yicha kelishuvlar.</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Investor va ishtirokchi uchun tezkor chat</CardTitle>
            <p className="text-sm text-muted-foreground">
              Yarmarka davomida investorlar va g'oya mualliflari shu yerdan tezkor savol-javob qilishi, fayl va uchrashuvlar haqida kelishishi mumkin.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-lg bg-muted/30 p-4 max-h-96 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "investor" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-3 shadow-sm ${
                      message.role === "investor"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border"
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1 opacity-80">
                      {roleLabels[message.role]}
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                    <div className="text-[10px] opacity-70 mt-2 text-right">{message.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-semibold">Investor javobi</div>
                <Textarea
                  placeholder="Masalan: Loyihaning biznes modeli haqida qo'shimcha ma'lumot bera olasizmi?"
                  value={investorMessage}
                  onChange={(e) => setInvestorMessage(e.target.value)}
                  className="min-h-[120px]"
                  data-testid="textarea-investor-message"
                />
                <Button
                  onClick={handleInvestorSend}
                  className="w-full md:w-auto"
                  disabled={!investorMessage.trim()}
                  data-testid="button-send-investor"
                >
                  Investor xabari
                </Button>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold">Ishtirokchi javobi</div>
                <Textarea
                  placeholder="Masalan: Tizim quyosh panellari samaradorligini 18% gacha oshiradi."
                  value={participantMessage}
                  onChange={(e) => setParticipantMessage(e.target.value)}
                  className="min-h-[120px]"
                  data-testid="textarea-participant-message"
                />
                <Button
                  onClick={handleParticipantSend}
                  className="w-full md:w-auto"
                  variant="outline"
                  disabled={!participantMessage.trim()}
                  data-testid="button-send-participant"
                >
                  Ishtirokchi xabari
                </Button>
              </div>
            </div>
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

