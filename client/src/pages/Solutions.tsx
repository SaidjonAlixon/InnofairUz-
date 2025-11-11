import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Wrench, ClipboardCheck } from "lucide-react";

const regionalChallenges = [
  {
    region: "Farg'ona vodiysi",
    problem: "Qishloq xo'jaligida suv resurslaridan samarasiz foydalanish",
    solution: "IoT sensorlar asosidagi sug'orish nazorati va suvni hisoblash tizimi, 35% gacha tejamkorlik.",
  },
  {
    region: "Qoraqalpog'iston",
    problem: "Uzoq hududlarda tibbiy xizmatlardan foydalanish imkoniyati cheklangan",
    solution: "Mobil telemeditsina punktlari va dron orqali dori yetkazib berish platformasi.",
  },
  {
    region: "Buxoro viloyati",
    problem: "Tarixiy ob'ektlarni restavratsiya qilishda zamonaviy materiallar yetishmasligi",
    solution: "Mahalliy xomashyo asosida innovatsion kompozit material ishlab chiqish va pilot sinovlar.",
  },
];

const actionPlan = [
  "Muammoni tavsiflash va maqsadli indikatorlarni aniqlash",
  "InnofairUz ekspertlari bilan birgalikda texnik yechimni tanlash",
  "Pilot loyiha uchun hudud va sheriklarni belgilash",
  "Monitoring va natijalar bo'yicha hisobot tayyorlash",
];

export default function SolutionsPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-10">
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <Badge variant="outline" className="mx-auto w-fit px-4 py-1 text-sm">
            Hududiy yechimlar katalogi
          </Badge>
          <h1 className="text-4xl font-bold">Hududiy muammolar va yechim takliflari</h1>
          <p className="text-lg text-muted-foreground">
            Viloyatlar kesimida aniqlangan dolzarb muammolar va ularga mos innovatsion yechimlar. Har bir tashabbus monitoring va hamkorlik imkoniyatlari bilan birga taqdim etiladi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {regionalChallenges.map((item) => (
            <Card key={item.region} className="hover-elevate active-elevate-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {item.region}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-semibold text-foreground">Muammo</h4>
                  <p>{item.problem}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Taklif etilgan yechim</h4>
                  <p>{item.solution}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Hamkorlik reja-kalendari
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
            {actionPlan.map((step, index) => (
              <div key={step} className="border rounded-lg p-4">
                <Badge variant="secondary" className="mb-2">{index + 1}-bosqich</Badge>
                <p>{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              Yechim taklif etmoqchimisiz?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• Hududiy muammo tafsilotlarini va mavjud resurslarni ko'rsating.</p>
            <p>• Yechimning texnik tavsifi va kutilayotgan natijalarni yozib qoldiring.</p>
            <p>• Hamkorlik uchun tegishli tashkilotlar va mas'ullarni qo'shing.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

