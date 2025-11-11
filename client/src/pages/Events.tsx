import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Category, News } from "@shared/schema";
import NewsCard from "@/components/NewsCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

const staticSessions = [
  {
    time: "09:30",
    title: "Hududiy innovatsion ko'rgazma ochilishi",
    description: "Viloyat hokimligi va InnofairUz hamkorligidagi rasmiy start, hamkorlar taqdimoti.",
  },
  {
    time: "11:00",
    title: "Startaplar pitch sessiyasi",
    description: "10 ta tanlab olingan jamoa o'z g'oyasini investorlar va ekspertlarga namoyish etadi.",
  },
  {
    time: "14:30",
    title: "Master-klass: Tijoratlashtirish strategiyalari",
    description: "Bozor tahlili, intellektual mulk huquqlari va moliyalashtirish bo'yicha amaliy tavsiyalar.",
  },
  {
    time: "16:00",
    title: "B2B Networking",
    description: "Sanoat vakillari, universitetlar va tadqiqotchilar o'rtasida hamkorlik uchrashuvlari.",
  },
];

export default function EventsPage() {
  const { data: newsList = [], isLoading } = useQuery<News[]>({
    queryKey: ["/api/news"],
    select: (data) => data.filter(item => item.published),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const displayEvents = useMemo(() => {
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

    const events = newsList.map(item => {
      const slug = getCategorySlug(item.categoryId);
      const image = slug ? (categoryImages[slug] || techImage) : techImage;
      return {
        id: item.id,
        image,
        category: getCategoryName(item.categoryId),
        title: item.title,
        date: new Date(item.createdAt).toLocaleDateString('uz-UZ', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
      };
    });

    events.push({
      id: "innofairuz-bootcamp",
      image: startupImage,
      category: "Startap",
      title: "InnofairUz bootcamp: mentorlik sessiyalari uchun ro'yxat boshlandi",
      date: new Date("2025-04-02").toLocaleDateString("uz-UZ", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    });

    return events;
  }, [newsList, categories]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Tadbirlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-10">
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <Badge variant="outline" className="mx-auto w-fit px-4 py-1 text-sm">
            InnofairUz Tadbirlar Markazi
          </Badge>
          <h1 className="text-4xl font-bold">Innovatsion yarmarka tadbirlari taqvimi</h1>
          <p className="text-lg text-muted-foreground">
            Onlayn va oflayn formatdagi yarmarka sessiyalari, konferensiyalar, master-klasslar va networking uchrashuvlari jadvali.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayEvents.length > 0 ? (
              displayEvents.map((event) => (
                <NewsCard key={event.id} {...event} />
              ))
            ) : (
              <p className="col-span-2 text-center text-muted-foreground py-12">
                Hozircha jadvalga qo'shilgan rasmiy tadbirlar mavjud emas.
              </p>
            )}
          </div>

          <Card className="h-fit sticky top-28">
            <CardHeader>
              <CardTitle>Kun tartibi namunasi</CardTitle>
              <p className="text-sm text-muted-foreground">
                Har bir yarmarka kuni davomida bo'lib o'tadigan asosiy sessiyalar.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {staticSessions.map((session) => (
                <div key={session.time} className="border rounded-lg p-4 space-y-2">
                  <Badge variant="secondary" className="w-fit">
                    {session.time}
                  </Badge>
                  <h3 className="font-semibold text-base">{session.title}</h3>
                  <p className="text-sm text-muted-foreground">{session.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

