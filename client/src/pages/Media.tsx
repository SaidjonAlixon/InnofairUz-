import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Video, Mic } from "lucide-react";

const mediaLibrary = [
  {
    title: "Muvaffaqiyat hikoyasi: Quyosh energiyasi startapi",
    description: "Qashqadaryo viloyatidagi quyosh panellari loyihasi qanday qilib investitsiya jalb qilib, ishlab chiqarishni yo'lga qo'yganini tomosha qiling.",
    duration: "12:48",
    type: "Video intervyu",
  },
  {
    title: "Master-klass: Tijoratlashtirish strategiyasi",
    description: "Sanoat vakillari va startaplar uchun bozorda pozitsiyalash, patentlash va investorlar bilan muzokara olib borish bo'yicha amaliy maslahatlar.",
    duration: "46:15",
    type: "Master-klass",
  },
  {
    title: "Panel muhokamasi: Hududiy innovatsiya markazlari",
    description: "Viloyat hokimliklari, universitetlar va xususiy sektor vakillari ishtirokidagi panel muhokamasi audio yozuvi.",
    duration: "38:02",
    type: "Podcast",
  },
];

const upcomingStreams = [
  {
    title: "inno-fair.uz 2025: Ochiq innovatsiyalar sessiyasi",
    date: "15-mart, 2025",
    description: "Yarmarka doirasidagi asosiy sahna, investorlarga taqdimotlar va imzo marosimlari to'g'ridan-to'g'ri efirda.",
  },
  {
    title: "Mentorlik: Ilmiy ishlanmalarni startapga aylantirish",
    date: "22-mart, 2025",
    description: "Yashil energetika va agrotech yo'nalishlarida mentorlar bilan interaktiv uchrashuv.",
  },
];

export default function MediaPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-10">
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <Badge variant="outline" className="mx-auto w-fit px-4 py-1 text-sm">
            Media va bilim markazi
          </Badge>
          <h1 className="text-4xl font-bold">Video va media kontent</h1>
          <p className="text-lg text-muted-foreground">
            Muvaffaqiyatli tajribalar, intervyular, master-klasslar va panel muhokamalar bilan tanishib, innovatsion ekotizimdagi eng yaxshi amaliyotlarni o'rganing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mediaLibrary.map((item) => (
            <Card key={item.title} className="overflow-hidden hover-elevate active-elevate-2">
              <CardHeader className="space-y-2">
                <CardTitle>{item.title}</CardTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <PlayCircle className="h-4 w-4" />
                  <span>{item.duration}</span>
                  <span>РІР‚Сћ</span>
                  <span>{item.type}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Yaqin vaqtidagi jonli efirlar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingStreams.map((stream) => (
                <div key={stream.title} className="border rounded-lg p-4 space-y-2">
                  <Badge variant="secondary">{stream.date}</Badge>
                  <h3 className="font-semibold text-base">{stream.title}</h3>
                  <p className="text-sm text-muted-foreground">{stream.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-primary" />
                Media hamkorlari uchun
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>РІР‚Сћ Yarmarka sessiyalariga akkreditatsiya olish uchun press@inno-fair.uz.uz manziliga yozing.</p>
              <p>РІР‚Сћ Video va audio materiallardan foydalanishda manba sifatida inno-fair.uz ko'rsatilishi shart.</p>
              <p>РІР‚Сћ Ekspert intervyular va master-klasslar uchun oldindan ariza topshirish talab etiladi.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}




