import { Target, Users, Lightbulb, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import teamImage from "@assets/generated_images/Team_collaboration_photo_157623c8.png";

export default function About() {
  const values = [
    {
      icon: Target,
      title: "Maqsadimiz",
      description: "O'zbekiston va jahon miqyosidagi innovatsion ishlanmalarni keng jamoatchilikka yetkazish",
    },
    {
      icon: Lightbulb,
      title: "Innovatsiya",
      description: "Yangi g'oyalar va texnologiyalarni qo'llab-quvvatlash orqali taraqqiyotga hissa qo'shish",
    },
    {
      icon: Users,
      title: "Hamkorlik",
      description: "Innovatorlar, tadqiqotchilar va investorlarni birlashtirish",
    },
    {
      icon: Award,
      title: "Sifat",
      description: "Yuqori sifatli va ishonchli ma'lumotlar bilan ta'minlash",
    },
  ];

  const team = [
    {
      name: "Aziz Normatov",
      role: "Asoschi va Bosh direktor",
      avatar: "",
    },
    {
      name: "Malika Yusupova",
      role: "Texnologiya direktori",
      avatar: "",
    },
    {
      name: "Javohir Karimov",
      role: "Kontent rahbari",
      avatar: "",
    },
    {
      name: "Dilnoza Rahimova",
      role: "Marketing menejeri",
      avatar: "",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Biz haqimizda</h1>
            <p className="text-lg text-muted-foreground">
              InnovaUz - O'zbekiston va jahon miqyosidagi innovatsion ishlanmalar, ixtirolar va ilmiy g'oyalarni yorituvchi yetakchi platforma
            </p>
          </div>

          <div className="aspect-video w-full overflow-hidden rounded-lg mb-16">
            <img
              src={teamImage}
              alt="InnovaUz jamoasi"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Bizning qadriyatlarimiz</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card key={index} className="hover-elevate active-elevate-2">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{value.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-4">Bizning missiyamiz</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p>
                InnovaUz platformasi O'zbekistonda innovatsion g'oyalar va ishlanmalarni rivojlantirishga, ularni keng jamoatchilikka yetkazishga va investorlar bilan bog'lashga yordam beradi.
              </p>
              <p>
                Biz ilm-fan, texnologiya va innovatsiya sohasidagi eng so'nggi yutuqlar haqida ma'lumot beramiz, tadqiqotchilar va ixtirochilar uchun o'z ishlarini namoyish etish imkoniyatini yaratamiz.
              </p>
              <p>
                Platformamiz orqali minglab innovator, tadqiqotchi va innovatsiya ishqibozlari bir-birlari bilan bog'lanib, yangi g'oyalarni hayotga tatbiq etishadi.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-8 text-center">Bizning jamoa</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <Card key={index} className="text-center hover-elevate active-elevate-2">
                  <CardContent className="pt-6">
                    <Avatar className="h-24 w-24 mx-auto mb-4">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="text-2xl">{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold mb-1">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-16 text-center">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4">SAYD.X</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  InnovaUz platformasi SAYD.X texnologiya kompaniyasi tomonidan ishlab chiqilgan va qo'llab-quvvatlanmoqda. SAYD.X - innovatsion yechimlar yaratish va raqamli transformatsiyaga ixtisoslashgan yetakchi IT kompaniya.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
