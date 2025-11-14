import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Category, Innovation, User } from "@shared/schema";
import InnovationCard from "@/components/InnovationCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MapPin, MessageCircle, Phone, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import techImage from "@assets/generated_images/Technology_robotics_innovation_8147fb21.png";
import medicalImage from "@assets/generated_images/Medical_innovation_research_c66d4f7e.png";
import eduImage from "@assets/generated_images/Education_technology_innovation_5af2e17a.png";
import energyImage from "@assets/generated_images/Energy_innovation_facility_bf558b54.png";
import startupImage from "@assets/generated_images/Startup_innovation_workspace_3d5e0d40.png";
import agriImage from "@assets/generated_images/Agricultural_innovation_technology_58a8de7a.png";

const categoryImages: Record<string, string> = {
  "texnologiya": techImage,
  "tibbiyot": medicalImage,
  "talim": eduImage,
  "energetika": energyImage,
  "startap": startupImage,
  "qishloq-xojaligi": agriImage,
};

const aboutValues = [
  {
    title: "Maqsadimiz",
    description: "Hududiy innovatsion tashabbuslarni bir ekotizimga jamlab, ularni tezkor hamkorlik va investitsiya oqimlariga ulash.",
  },
  {
    title: "Innovatsiya",
    description: "Texnologiyalar, ilmiy ishlanmalar va startaplarni qo'llab-quvvatlash orqali yangi yechimlarni tezroq tijoratlashtirish.",
  },
  {
    title: "Hamkorlik",
    description: "Investorlar, davlat tashkilotlari, universitetlar va ishlab chiqaruvchilarni yagona platformada bog'lash.",
  },
  {
    title: "Sifat",
    description: "Har bir loyiha va g'oya ustidan ekspert nazorati hamda ma'lumotlarning shaffofligini ta'minlash.",
  },
];

const teamMembers = [
  { name: "Aziz Normatov", role: "Ta'sischi va direktor", avatar: "" },
  { name: "Malika Yusupova", role: "Innovatsiyalar koordinatori", avatar: "" },
  { name: "Javohir Karimov", role: "Hamkorlik menejeri", avatar: "" },
  { name: "Dilnoza Rahimova", role: "Media va PR rahbari", avatar: "" },
];

export default function CollaborationPage() {
  const { data: innovations = [], isLoading } = useQuery<Innovation[]>({
    queryKey: ["/api/innovations?published=false"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Umumiy";
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "Umumiy";
  };

  const getCategorySlug = (categoryId: string | null) => {
    if (!categoryId) return null;
    const category = categories.find(c => c.id === categoryId);
    return category?.slug || null;
  };

  const getImageForCategory = (categoryId: string | null) => {
    const slug = getCategorySlug(categoryId);
    if (!slug) return techImage;
    return categoryImages[slug] || techImage;
  };

  const getAuthorName = (authorId: string) => {
    const author = users.find(u => u.id === authorId);
    return author?.fullName || "Noma'lum muallif";
  };

  const { toast } = useToast();
  const [feedback, setFeedback] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Fikringiz qabul qilindi!",
      description: "Moderatorlar tez orada aloqaga chiqadi.",
    });
    setFeedback({ name: "", email: "", message: "" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">G'oyalar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const displayIdeas = innovations.map(innovation => ({
    id: innovation.id,
    image: getImageForCategory(innovation.categoryId),
    category: getCategoryName(innovation.categoryId),
    title: innovation.title,
    description: innovation.description,
    author: { name: getAuthorName(innovation.authorId) },
    likes: innovation.likes,
    comments: 0,
  }));

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-10">
        <div className="space-y-4 text-center">
          <Badge variant="outline" className="mx-auto w-fit gap-2 text-sm">
            <Users className="h-4 w-4" />
            Hamkorlik va fikrlar
          </Badge>
          <h1 className="text-4xl font-bold">Hamkorlik va fikrlar maydoni</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            inno-fair.uz ishtirokchilari g'oya statusini muhokama qiladi, sherik topadi va savol-javoblar orqali hamkorlikni mustahkamlaydi.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Yangi savol yoki hamkorlik taklifi qoldiring</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Moderatorlar va investorlar sizning so'rovingizga javob berishlari uchun qisqacha ma'lumot yozing.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      placeholder="Ismingiz"
                      value={feedback.name}
                      onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                      required
                      data-testid="input-feedback-name"
                    />
                    <Input
                      type="email"
                      placeholder="Email manzilingiz"
                      value={feedback.email}
                      onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                      required
                      data-testid="input-feedback-email"
                    />
                  </div>
                  <Textarea
                    placeholder="G'oya, savolingiz yoki hamkorlik g'oyasini qisqacha yozing"
                    className="min-h-[140px]"
                    value={feedback.message}
                    onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                    required
                    data-testid="textarea-feedback-message"
                  />
                  <Button type="submit" className="w-full sm:w-auto" data-testid="button-submit-feedback">
                    Fikr yuborish
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayIdeas.length > 0 ? (
                displayIdeas.map((idea) => (
                  <InnovationCard key={idea.id} {...idea} />
                ))
              ) : (
                <p className="col-span-2 text-center text-muted-foreground py-12 border rounded-lg">
                  Hozircha muhokamada bo'lgan g'oyalar mavjud emas. Birinchi bo'lib taklif kiriting!
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Jamoa qoidalari
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>РІР‚Сћ Har bir fikr konstruktiv va aniq maqsadga yo'naltirilgan bo'lsin.</p>
                <p>РІР‚Сћ G'oya muallifining mualliflik huquqlariga hurmat bilan yondoshing.</p>
                <p>РІР‚Сћ Hamkorlik takliflarida bog'lanish ma'lumotlarini qoldirishni unutmang.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hamkor topish bo'yicha ko'rsatmalar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>РІР‚Сћ G'oyangizning bosqichini va kerakli resurslarni ko'rsating.</p>
                <p>РІР‚Сћ Qaysi hudud yoki soha uchun yechim taklif qilayotganingizni aniq yozing.</p>
                <p>РІР‚Сћ Uchrashuv uchun qulay vaqt va formatni taklif qiling.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12 space-y-10">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">inno-fair.uz haqida</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            inno-fair.uz РІР‚вЂќ mintaqaviy innovatsion yarmarka platformasi. Hamkorlik sahifasidayoq bizning qadriyatlarimiz, missiyamiz va jamoamiz bilan tanishib,
            g'oyangizni qanday qo'llab-quvvatlashimizni bilib olishingiz mumkin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {aboutValues.map((value) => (
            <Card key={value.title} className="hover-elevate active-elevate-2">
              <CardHeader>
                <CardTitle>{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Bizning missiyamiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              inno-fair.uz platformasi hududiy innovatsion tashabbuslarni raqamli makonda birlashtirib, ularni tezkor axborot almashuvi, ekspertiza va investitsiya
              imkoniyatlari bilan ta'minlaydi. Biz g'oyalarni tijorat mahsulotiga aylantirishga ko'maklashamiz.
            </p>
            <p>
              Hamkorlik sahifasi orqali siz fikr bildirishingiz, sherik topishingiz va jamoamiz bilan to'g'ridan-to'g'ri aloqaga chiqishingiz mumkin РІР‚вЂќ barcha ma'lumotlar
              shu yerda jamlangan.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h3 className="text-3xl font-bold text-center">Jamoamiz</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <Card key={member.name} className="text-center hover-elevate active-elevate-2">
                <CardContent className="pt-6">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-xl">{member.name[0]}</AvatarFallback>
                  </Avatar>
                  <h4 className="font-semibold">{member.name}</h4>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-muted/40">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Biz bilan bog'laning</CardTitle>
            <p className="text-muted-foreground text-sm text-center max-w-2xl mx-auto">
              Hamkorlik takliflari, media hamkorlik yoki savollar bo'lsa, quyidagi kanal orqali aloqaga chiqing.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Manzil</h4>
                <p className="text-sm text-muted-foreground">Toshkent shahri, Chilonzor tumani, Algoritm ko'chasi, 1-uy</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Telefon</h4>
                <p className="text-sm text-muted-foreground">+998 (90) 123-45-67</p>
                <p className="text-sm text-muted-foreground">+998 (71) 234-56-78</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Elektron pochta</h4>
                <p className="text-sm text-muted-foreground">info@inno-fair.uz.uz</p>
                <p className="text-sm text-muted-foreground">partnership@inno-fair.uz.uz</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}




